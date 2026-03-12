import React from "react";
import { Line, Group, Circle } from "react-konva";
import {
  COLOR_NAV_NODE,
  COLOR_NAV_ACTIVE,
  COLOR_SELECTION,
} from "../constants";

/**
 * Renders navigation nodes (waypoints) and edges (paths between nodes).
 */
const NavigationLayer = ({
  navNodes,
  navEdges,
  designMode,
  selectedIds,
  activeNodeId,
  handleSelect,
}) => {
  return (
    <Group opacity={designMode === "NAV" ? 1 : 0.4}>
      {/* Navigation Edges */}
      {navEdges.map((edge) => {
        const n1 = navNodes.find((n) => n.id === edge.from);
        const n2 = navNodes.find((n) => n.id === edge.to);
        if (n1 && n2)
          return (
            <Line
              key={edge.id}
              points={[n1.x, n1.y, n2.x, n2.y]}
              stroke={COLOR_NAV_NODE}
              strokeWidth={3}
              lineCap="round"
            />
          );
        return null;
      })}

      {/* Navigation Nodes */}
      {navNodes.map((n) => (
        <Group
          key={n.id}
          id={n.id}
          x={n.x}
          y={n.y}
          onClick={(e) => handleSelect(e, n.id)}
        >
          <Circle
            radius={6}
            fill={activeNodeId === n.id ? COLOR_NAV_ACTIVE : COLOR_NAV_NODE}
            stroke={selectedIds.includes(n.id) ? COLOR_SELECTION : "#fff"}
            strokeWidth={2}
          />
        </Group>
      ))}
    </Group>
  );
};

export default NavigationLayer;
