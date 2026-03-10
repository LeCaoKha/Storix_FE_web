import React, { useState, useMemo } from "react";
import { Stage, Layer, Circle, Line, Rect, Text, Group } from "react-konva";

/* =========================
    DATA GIAO THÔNG (Khung xương)
========================= */
const NAV_NODES = [
  { id: "START", x: 50, y: 100 },
  { id: "N1", x: 150, y: 100 },
  { id: "N2", x: 400, y: 100 },
  { id: "N3", x: 750, y: 100 },
  { id: "N4", x: 150, y: 250 },
  { id: "N5", x: 400, y: 250 },
  { id: "N6", x: 750, y: 250 },
  { id: "N7", x: 150, y: 400 },
  { id: "N8", x: 400, y: 400 },
  { id: "N9", x: 750, y: 400 },
  { id: "END", x: 850, y: 400 },
];

const NAV_EDGES = [
  ["START", "N1"],
  ["N1", "N2"],
  ["N2", "N3"],
  ["N1", "N4"],
  ["N2", "N5"],
  ["N3", "N6"],
  ["N4", "N7"],
  ["N5", "N8"],
  ["N6", "N9"],
  ["N4", "N5"],
  ["N5", "N6"],
  ["N7", "N8"],
  ["N8", "N9"],
  ["N9", "END"],
];

const SHELVES_DATA = [
  { id: "A", x: 200, y: 40, w: 80, h: 30, ap: { dx: 40, dy: 60 } },
  { id: "B", x: 550, y: 40, w: 80, h: 30, ap: { dx: 40, dy: 60 } },
  { id: "C", x: 200, y: 320, w: 80, h: 30, ap: { dx: 40, dy: -20 } },
  { id: "D", x: 550, y: 320, w: 80, h: 30, ap: { dx: 40, dy: -20 } },
];

/* =========================
    LOGIC THUẬT TOÁN (DIJKSTRA)
========================= */
const buildGraph = (shelves) => {
  const adj = {};
  NAV_NODES.forEach((n) => (adj[n.id] = []));
  NAV_EDGES.forEach(([a, b]) => {
    const na = NAV_NODES.find((n) => n.id === a);
    const nb = NAV_NODES.find((n) => n.id === b);
    const d = Math.hypot(na.x - nb.x, na.y - nb.y);
    adj[a].push({ to: b, dist: d });
    adj[b].push({ to: a, dist: d });
  });
  // Nối Access Points ảo
  shelves.forEach((s) => {
    const apId = `AP-${s.id}`;
    const apPos = { x: s.x + s.ap.dx, y: s.y + s.ap.dy };
    adj[apId] = [];
    let nearest = NAV_NODES[0];
    let minDist = Infinity;
    NAV_NODES.forEach((n) => {
      const d = Math.hypot(n.x - apPos.x, n.y - apPos.y);
      if (d < minDist) {
        minDist = d;
        nearest = n;
      }
    });
    adj[apId].push({ to: nearest.id, dist: minDist });
    adj[nearest.id].push({ to: apId, dist: minDist });
  });
  return adj;
};

const getDijkstraPath = (graph, start, end) => {
  const dists = {};
  const prevs = {};
  const visited = new Set();
  Object.keys(graph).forEach((k) => (dists[k] = Infinity));
  dists[start] = 0;
  while (visited.size < Object.keys(graph).length) {
    let u = null;
    for (const n in dists)
      if (!visited.has(n) && (u === null || dists[n] < dists[u])) u = n;
    if (u === null || dists[u] === Infinity) break;
    visited.add(u);
    if (u === end) break;
    graph[u].forEach((e) => {
      const alt = dists[u] + e.dist;
      if (alt < dists[e.to]) {
        dists[e.to] = alt;
        prevs[e.to] = u;
      }
    });
  }
  const path = [];
  let curr = end;
  while (curr) {
    path.unshift(curr);
    curr = prevs[curr];
  }
  return path[0] === start ? path : [];
};

/* =========================
    COMPONENT CHÍNH
========================= */
export default function WarehousePicker() {
  const [selected, setSelected] = useState([]);
  const graph = useMemo(() => buildGraph(SHELVES_DATA), []);

  // Tính toán lộ trình đi qua tất cả kệ đã chọn (Thứ tự đơn giản theo ID)
  const fullPath = useMemo(() => {
    if (selected.length === 0) return getDijkstraPath(graph, "START", "END");

    let combinedPath = ["START"];
    let lastPoint = "START";

    // Đi qua từng kệ đã chọn
    [...selected].sort().forEach((shelfId) => {
      const target = `AP-${shelfId}`;
      const segment = getDijkstraPath(graph, lastPoint, target);
      combinedPath = [...combinedPath, ...segment.slice(1)];
      lastPoint = target;
    });

    // Về END
    const finalSegment = getDijkstraPath(graph, lastPoint, "END");
    return [...combinedPath, ...finalSegment.slice(1)];
  }, [selected, graph]);

  const toggleShelf = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const getPos = (id) => {
    const nav = NAV_NODES.find((n) => n.id === id);
    if (nav) return nav;
    const s = SHELVES_DATA.find((sh) => `AP-${sh.id}` === id);
    return { x: s.x + s.ap.dx, y: s.y + s.ap.dy };
  };

  return (
    <div
      style={{
        padding: "20px",
        background: "#0f172a",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ marginBottom: "20px" }}>
        <h3>Chọn kệ cần lấy hàng:</h3>
        <div style={{ display: "flex", gap: "15px" }}>
          {SHELVES_DATA.map((s) => (
            <label
              key={s.id}
              style={{
                background: selected.includes(s.id) ? "#3b82f6" : "#334155",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(s.id)}
                onChange={() => toggleShelf(s.id)}
                style={{ marginRight: "10px" }}
              />
              Kệ {s.id}
            </label>
          ))}
        </div>
      </div>

      <Stage
        width={900}
        height={500}
        style={{ background: "#1e293b", borderRadius: "12px" }}
      >
        <Layer>
          {/* Vẽ Mạng lưới */}
          {NAV_EDGES.map(([a, b], i) => {
            const n1 = getPos(a);
            const n2 = getPos(b);
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
          {SHELVES_DATA.map((s) => {
            const isPicked = selected.includes(s.id);
            const ap = getPos(`AP-${s.id}`);
            return (
              <Group key={s.id}>
                <Rect
                  x={s.x}
                  y={s.y}
                  width={s.w}
                  height={s.h}
                  fill={isPicked ? "#ef4444" : "#475569"}
                  cornerRadius={4}
                />
                <Text
                  x={s.x + 30}
                  y={s.y + 10}
                  text={s.id}
                  fill="white"
                  fontStyle="bold"
                />
                <Circle
                  x={ap.x}
                  y={ap.y}
                  radius={4}
                  fill="#10b981"
                  opacity={isPicked ? 1 : 0.2}
                />
              </Group>
            );
          })}

          {/* Vẽ ĐƯỜNG ĐI TỐI ƯU */}
          {fullPath.length > 1 &&
            fullPath.map((id, i) => {
              if (i === fullPath.length - 1) return null;
              const p1 = getPos(fullPath[i]);
              const p2 = getPos(fullPath[i + 1]);
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

          {/* Điểm đầu/cuối */}
          <Circle x={50} y={100} radius={8} fill="#10b981" />
          <Text x={35} y={115} text="BẮT ĐẦU" fill="#10b981" fontSize={10} />
          <Circle x={850} y={400} radius={8} fill="#f43f5e" />
          <Text x={835} y={415} text="KẾT THÚC" fill="#f43f5e" fontSize={10} />
        </Layer>
      </Stage>
    </div>
  );
}
