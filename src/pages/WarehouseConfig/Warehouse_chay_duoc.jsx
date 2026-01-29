import React, { useMemo } from "react";
import { Stage, Layer, Circle, Line, Rect, Text, Group } from "react-konva";

/* =========================
    HARD-CODE DATA (GIỮ NGUYÊN)
========================= */
const NAV_NODES = [
  { id: "START", x: 50, y: 100 },
  { id: "N1", x: 150, y: 100 },
  { id: "N2", x: 300, y: 100 },
  { id: "N3", x: 450, y: 100 },
  { id: "N4", x: 600, y: 100 },
  { id: "N5", x: 750, y: 100 },
  { id: "N6", x: 150, y: 175 },
  { id: "N7", x: 450, y: 175 },
  { id: "N8", x: 750, y: 175 },
  { id: "N9", x: 150, y: 250 },
  { id: "N10", x: 450, y: 250 },
  { id: "N11", x: 750, y: 250 },
  { id: "N12", x: 150, y: 325 },
  { id: "N13", x: 450, y: 325 },
  { id: "N14", x: 750, y: 325 },
  { id: "N15", x: 150, y: 400 },
  { id: "N16", x: 450, y: 400 },
  { id: "N17", x: 750, y: 400 },
  { id: "ACN1", x: 300, y: 50 },
  { id: "ACN2", x: 450, y: 50 },
  { id: "ACN3", x: 250, y: 200 },
  { id: "ACN4", x: 300, y: 200 },
  { id: "ACN5", x: 600, y: 200 },
  { id: "ACN6", x: 650, y: 200 },
  { id: "ACN7", x: 250, y: 350 },
  { id: "ACN8", x: 300, y: 350 },
  { id: "ACN9", x: 600, y: 350 },
  { id: "ACN10", x: 650, y: 350 },
  { id: "ACN11", x: 275, y: 180 },

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
  ["N9", "N12"],
  ["N12", "N15"],
  ["N3", "N7"],
  ["N7", "N10"],
  ["N10", "N13"],
  ["N13", "N16"],
  ["N5", "N8"],
  ["N8", "N11"],
  ["N11", "N14"],
  ["N14", "N17"],
  ["N9", "N10"],
  ["N10", "N11"],
  ["N15", "N16"],
  ["N16", "N17"],
  ["N17", "END"],
  ["N2", "ACN1"],
  ["N3", "ACN2"],
  ["N6", "ACN3"],
  ["N7", "ACN4"],
  ["N7", "ACN5"],
  ["N8", "ACN6"],
  ["N12", "ACN7"],
  ["N13", "ACN8"],
  ["N13", "ACN9"],
  ["N14", "ACN10"],
  ["N2", "ACN11"],
];

const SHELVES = [
  { id: "SHELF-A", accessNodeIds: ["ACN1"] },
  { id: "SHELF-B", accessNodeIds: ["ACN2"] },
  { id: "SHELF-C", accessNodeIds: ["ACN3", "ACN4", "ACN11"] },
  { id: "SHELF-D", accessNodeIds: ["ACN5", "ACN6"] },
  { id: "SHELF-E", accessNodeIds: ["ACN7", "ACN8"] },
  { id: "SHELF-F", accessNodeIds: ["ACN9", "ACN10"] },
];

/* =========================
    LOGIC TỐI ƯU HÓA MỚI
========================= */

// 1. Xây dựng đồ thị kề
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
  return adj;
};

// 2. Thuật toán Dijkstra trả về dist và prev cho một node
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

// 3. Hàm tìm lộ trình tối ưu (Optimal TSP)
const findOptimalPath = (graph, pickedShelves) => {
  const allShelvesData = pickedShelves.map((id) =>
    SHELVES.find((s) => s.id === id),
  );

  let minTotalDist = Infinity;
  let bestFullPath = [];

  // Tạo các hoán vị của kệ (Permutations)
  const permute = (arr, m = []) => {
    if (arr.length === 0) {
      checkPath(m);
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice();
        let next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next));
      }
    }
  };

  const checkPath = (shelfOrder) => {
    // Với mỗi thứ tự kệ, ta lại phải thử các tổ hợp Access Nodes
    const solveAccessNodes = (index, currentPath, currentDist, lastNodeId) => {
      if (index === shelfOrder.length) {
        // Chặng cuối về END
        const { dists, prevs } = getDijkstra(graph, lastNodeId);
        const toEnd = [];
        let curr = "END";
        while (curr) {
          toEnd.unshift(curr);
          curr = prevs[curr];
        }

        const finalDist = currentDist + dists["END"];
        if (finalDist < minTotalDist) {
          minTotalDist = finalDist;
          bestFullPath = [...currentPath, ...toEnd.slice(1)];
        }
        return;
      }

      const shelf = shelfOrder[index];
      const { dists, prevs } = getDijkstra(graph, lastNodeId);

      shelf.accessNodeIds.forEach((acnId) => {
        const toAcn = [];
        let currNode = acnId;
        while (currNode) {
          toAcn.unshift(currNode);
          currNode = prevs[currNode];
        }

        solveAccessNodes(
          index + 1,
          [...currentPath, ...toAcn.slice(1)],
          currentDist + dists[acnId],
          acnId,
        );
      });
    };

    solveAccessNodes(0, ["START"], 0, "START");
  };

  permute(allShelvesData);
  return bestFullPath;
};

/* =========================
    COMPONENT HIỂN THỊ
========================= */

export default function WarehouseOptimalRender() {
  const graph = useMemo(buildGraph, []);
  const pickedShelves = ["SHELF-C", "SHELF-A", "SHELF-D", "SHELF-E"];

  const path = useMemo(() => findOptimalPath(graph, pickedShelves), [graph]);

  const getNode = (id) => NAV_NODES.find((n) => n.id === id);

  return (
    <div style={{ background: "#f3f4f6", padding: "10px" }}>
      <h3 style={{ textAlign: "center", color: "#1f2937" }}>
        AI Path Optimization: Absolute Optimal Mode
      </h3>
      <Stage
        width={1000}
        height={500}
        style={{
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        }}
      >
        <Layer>
          {/* Lưới đường đi cơ sở */}
          {NAV_EDGES.map(([a, b], i) => {
            const na = getNode(a);
            const nb = getNode(b);
            return (
              <Line
                key={i}
                points={[na.x, na.y, nb.x, nb.y]}
                stroke="#e5e7eb"
                strokeWidth={2}
              />
            );
          })}

          {/* Vẽ kệ hàng */}
          {SHELVES.map((s) => {
            const nodes = s.accessNodeIds.map(getNode);
            const cx = nodes.reduce((sum, n) => sum + n.x, 0) / nodes.length;
            const cy = nodes.reduce((sum, n) => sum + n.y, 0) / nodes.length;
            const isPicked = pickedShelves.includes(s.id);

            return (
              <Group key={s.id}>
                <Rect
                  x={cx - 25}
                  y={cy - 15}
                  width={50}
                  height={30}
                  fill={isPicked ? "#f87171" : "#818cf8"}
                  cornerRadius={4}
                />
                <Text
                  x={cx - 20}
                  y={cy - 5}
                  text={s.id.split("-")[1]}
                  fill="white"
                  fontSize={12}
                  fontStyle="bold"
                />
              </Group>
            );
          })}

          {/* Vẽ các Node giao thông */}
          {NAV_NODES.map((n) => (
            <Circle
              key={n.id}
              x={n.x}
              y={n.y}
              radius={3}
              fill={n.id === "START" || n.id === "END" ? "#10b981" : "#9ca3af"}
            />
          ))}

          {/* VẼ ĐƯỜNG ĐI TỐI ƯU (ĐÃ SỬA) */}
          {path.map((id, i) => {
            if (i === path.length - 1) return null;
            const a = getNode(path[i]);
            const b = getNode(path[i + 1]);
            return (
              <Line
                key={i}
                points={[a.x, a.y, b.x, b.y]}
                stroke="#ef4444"
                strokeWidth={3}
                lineCap="round"
                lineJoin="round"
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
