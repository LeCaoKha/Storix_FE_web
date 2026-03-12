import React from "react";
import { Rect, Line } from "react-konva";
import { GRID_SIZE } from "../constants";

/**
 * Renders the warehouse floor background and grid lines.
 */
const WarehouseGrid = ({ whSize }) => {
  const verticalLines = Math.floor(whSize.width / GRID_SIZE) + 1;
  const horizontalLines = Math.floor(whSize.height / GRID_SIZE) + 1;

  return (
    <>
      {/* Warehouse Floor */}
      <Rect
        id="warehouse-floor"
        width={whSize.width}
        height={whSize.height}
        fill="#fff"
        shadowBlur={5}
      />

      {/* Vertical Grid Lines */}
      {[...Array(verticalLines)].map((_, i) => (
        <Line
          key={`v-${i}`}
          points={[i * GRID_SIZE, 0, i * GRID_SIZE, whSize.height]}
          stroke="#f1f2f6"
          strokeWidth={1}
        />
      ))}

      {/* Horizontal Grid Lines */}
      {[...Array(horizontalLines)].map((_, i) => (
        <Line
          key={`h-${i}`}
          points={[0, i * GRID_SIZE, whSize.width, i * GRID_SIZE]}
          stroke="#f1f2f6"
          strokeWidth={1}
        />
      ))}
    </>
  );
};

export default WarehouseGrid;
