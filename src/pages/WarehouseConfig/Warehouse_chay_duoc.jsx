import React, { useState, useMemo } from "react";
import { Stage, Layer, Circle, Line, Rect, Text, Group } from "react-konva";

/* =========================
    DATA GIAO THÔNG CHÍNH (Xương sống)
========================= */
const NAV_NODES = [
  { id: "START", x: 50, y: 100 },
  { id: "N1", x: 150, y: 100 },
  { id: "N2", x: 300, y: 100 },
  { id: "N3", x: 450, y: 100 },
  { id: "N4", x: 600, y: 100 },
  { id: "N5", x: 750, y: 100 },
  { id: "N6", x: 150, y: 250 },
  { id: "N7", x: 450, y: 250 },
  { id: "N8", x: 750, y: 250 },
  { id: "N9", x: 150, y: 400 },
  { id: "N10", x: 450, y: 400 },
  { id: "N11", x: 750, y: 400 },
  { id: "END", x: 900, y: 400 },
];

const NAV_EDGES = [
  ["START", "N1"],
  ["N1", "N2"],
  ["N2", "N3"],
  ["N3", "N4"],
  ["N4", "N5"],
  ["N1", "N6"],
  ["N6", "N9"],
  ["N3", "N7"],
  ["N7", "N10"],
  ["N5", "N8"],
  ["N8", "N11"],
  ["N6", "N7"],
  ["N7", "N8"],
  ["N9", "N10"],
  ["N10", "N11"],
  ["N11", "END"],
];

/* =========================
    DATA KỆ HÀNG (Hỗ trợ Multi-Access ảo)
========================= */
const SHELVES = [
  {
    id: "SHELF-A",
    x: 260,
    y: 30,
    w: 80,
    h: 40,
    accessOffsets: [{ dx: 40, dy: 65 }],
  },
  {
    id: "SHELF-B",
    x: 560,
    y: 30,
    w: 80,
    h: 40,
    accessOffsets: [{ dx: 40, dy: 65 }],
  },
  {
    id: "SHELF-C",
    x: 200,
    y: 180,
    w: 120,
    h: 40,
    accessOffsets: [
      { dx: 20, dy: 65 },
      { dx: 100, dy: 65 },
    ],
  },
  {
    id: "SHELF-D",
    x: 600,
    y: 330,
    w: 80,
    h: 40,
    accessOffsets: [{ dx: 40, dy: -25 }],
  },
];

/* =========================
    LOGIC THUẬT TOÁN (Tối ưu TSP)
========================= */

// Hàm tìm node gần nhất
const findNearestNavNode = (point, nodes) => {
  let nearest = nodes[0];
  let minDist = Infinity;
  nodes.forEach((n) => {
    const d = Math.hypot(n.x - point.x, n.y - point.y);
    if (d < minDist) {
      minDist = d;
      nearest = n;
    }
  });
  return nearest;
};

// Xây dựng đồ thị bao gồm các điểm ảo
const buildGraph = () => {
  const adj = {};
  NAV_NODES.forEach((n) => (adj[n.id] = []));
  NAV_EDGES.forEach(([a, b]) => {
    const na = NAV_NODES.find((n) => n.id === a);
    const nb = NAV_NODES.find((n) => n.id === b);
    const dist = Math.hypot(na.x - nb.x, na.y - nb.y);
    adj[a].push({ to: b, dist });
    adj[b].push({ to: a, dist });
  });

  SHELVES.forEach((shelf) => {
    shelf.accessOffsets.forEach((offset, idx) => {
      const vId = `V-ACN-${shelf.id}-${idx}`;
      const vPos = { x: shelf.x + offset.dx, y: shelf.y + offset.dy };
      adj[vId] = [];
      const nearest = findNearestNavNode(vPos, NAV_NODES);
      const dist = Math.hypot(vPos.x - nearest.x, vPos.y - nearest.y);
      adj[vId].push({ to: nearest.id, dist });
      adj[nearest.id].push({ to: vId, dist });
    });
  });
  return adj;
};

// Dijkstra chuẩn
const getDijkstra = (graph, startNode) => {
  const dists = {};
  const prevs = {};
  const visited = new Set();
  Object.keys(graph).forEach((k) => (dists[k] = Infinity));
  dists[startNode] = 0;
  while (visited.size < Object.keys(graph).length) {
    let u = null;
    for (const node in dists) {
      if (!visited.has(node) && (u === null || dists[node] < dists[u]))
        u = node;
    }
    if (u === null || dists[u] === Infinity) break;
    visited.add(u);
    graph[u].forEach((edge) => {
      const alt = dists[u] + edge.dist;
      if (alt < dists[edge.to]) {
        dists[edge.to] = alt;
        prevs[edge.to] = u;
      }
    });
  }
  return { dists, prevs };
};

// Tìm đường đi tối ưu TSP qua các kệ đã chọn
const findOptimalPathTSP = (graph, pickedShelfIds) => {
  if (pickedShelfIds.length === 0) {
    const { prevs } = getDijkstra(graph, "START");
    let path = [];
    let curr = "END";
    while (curr) {
      path.unshift(curr);
      curr = prevs[curr];
    }
    return path;
  }

  let minTotalDist = Infinity;
  let bestFullPath = [];

  const permute = (arr, m = []) => {
    if (arr.length === 0) checkPath(m);
    else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr, m.concat(next));
      }
    }
  };

  const checkPath = (shelfOrder) => {
    // Với mỗi kệ trong order, chọn Access Node gần "vị trí hiện tại" nhất
    const solve = (index, currentPath, currentDist, lastNode) => {
      if (index === shelfOrder.length) {
        const { dists, prevs } = getDijkstra(graph, lastNode);
        const finalDist = currentDist + dists["END"];
        if (finalDist < minTotalDist) {
          minTotalDist = finalDist;
          let toEnd = [];
          let curr = "END";
          while (curr !== lastNode) {
            toEnd.unshift(curr);
            curr = prevs[curr];
          }
          bestFullPath = [...currentPath, ...toEnd];
        }
        return;
      }

      const shelf = SHELVES.find((s) => s.id === shelfOrder[index]);
      const { dists, prevs } = getDijkstra(graph, lastNode);

      // Tìm access node tốt nhất của kệ này
      let bestAcn = `V-ACN-${shelf.id}-0`;
      let minDistToAcn = Infinity;
      shelf.accessOffsets.forEach((_, idx) => {
        const acnId = `V-ACN-${shelf.id}-${idx}`;
        if (dists[acnId] < minDistToAcn) {
          minDistToAcn = dists[acnId];
          bestAcn = acnId;
        }
      });

      let toAcn = [];
      let curr = bestAcn;
      while (curr !== lastNode) {
        toAcn.unshift(curr);
        curr = prevs[curr];
      }
      solve(
        index + 1,
        [...currentPath, ...toAcn],
        currentDist + minDistToAcn,
        bestAcn,
      );
    };

    solve(0, ["START"], 0, "START");
  };

  permute(pickedShelfIds);
  return bestFullPath;
};

/* =========================
    UI COMPONENT
========================= */

export default function WarehouseTSPManager() {
  const [picked, setPicked] = useState(["SHELF-A", "SHELF-C"]);
  const graph = useMemo(buildGraph, []);
  const path = useMemo(
    () => findOptimalPathTSP(graph, picked),
    [graph, picked],
  );

  const getNodePos = (id) => {
    const nav = NAV_NODES.find((n) => n.id === id);
    if (nav) return nav;
    if (id.startsWith("V-ACN-")) {
      const parts = id.split("-");
      const sId = `${parts[1]}-${parts[2]}`;
      const idx = parseInt(parts[3]);
      const shelf = SHELVES.find((s) => s.id === sId);
      return {
        x: shelf.x + shelf.accessOffsets[idx].dx,
        y: shelf.y + shelf.accessOffsets[idx].dy,
      };
    }
    return { x: 0, y: 0 };
  };

  return (
    <div
      style={{
        background: "#0f172a",
        padding: "20px",
        color: "white",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {SHELVES.map((s) => (
          <label
            key={s.id}
            style={{
              background: picked.includes(s.id) ? "#3b82f6" : "#334155",
              padding: "10px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={picked.includes(s.id)}
              onChange={() =>
                setPicked((prev) =>
                  prev.includes(s.id)
                    ? prev.filter((i) => i !== s.id)
                    : [...prev, s.id],
                )
              }
            />{" "}
            {s.id}
          </label>
        ))}
      </div>

      <Stage
        width={1000}
        height={500}
        style={{ background: "#1e293b", borderRadius: "12px" }}
      >
        <Layer>
          {/* Vẽ Grid Giao Thông */}
          {NAV_EDGES.map(([a, b], i) => {
            const n1 = getNodePos(a);
            const n2 = getNodePos(b);
            return (
              <Line
                key={i}
                points={[n1.x, n1.y, n2.x, n2.y]}
                stroke="#334155"
                strokeWidth={1}
              />
            );
          })}

          {/* Vẽ Kệ */}
          {SHELVES.map((s) => (
            <Group key={s.id}>
              <Rect
                x={s.x}
                y={s.y}
                width={s.w}
                height={s.h}
                fill={picked.includes(s.id) ? "#ef4444" : "#3b82f6"}
                cornerRadius={4}
              />
              <Text
                x={s.x + 5}
                y={s.y + 12}
                text={s.id.split("-")[1]}
                fill="white"
                fontStyle="bold"
              />
              {s.accessOffsets.map((off, idx) => (
                <Circle
                  key={idx}
                  x={s.x + off.dx}
                  y={s.y + off.dy}
                  radius={3}
                  fill="#10b981"
                  opacity={0.4}
                />
              ))}
            </Group>
          ))}

          {/* Vẽ ĐƯỜNG ĐI TỐI ƯU (TSP) */}
          {path.map((id, i) => {
            if (i === path.length - 1) return null;
            const p1 = getNodePos(path[i]);
            const p2 = getNodePos(path[i + 1]);
            return (
              <Line
                key={i}
                points={[p1.x, p1.y, p2.x, p2.y]}
                stroke="#fbbf24"
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
              />
            );
          })}

          <Circle x={50} y={100} radius={6} fill="#10b981" />
          <Circle x={900} y={400} radius={6} fill="#f43f5e" />
        </Layer>
      </Stage>
    </div>
  );
}
