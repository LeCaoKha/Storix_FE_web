import React from "react";
import { Rect, Transformer } from "react-konva";
import { COLOR_SELECTION } from "../constants";

/**
 * Renders the Transformer for selected items and the
 * rubber-band selection rectangle.
 */
const SelectionOverlay = ({ trRef, selectionBox }) => {
  return (
    <>
      {/* Transformer for resizing/moving selected items */}
      <Transformer
        ref={trRef}
        rotateEnabled={false}
        flipEnabled={false}
        borderStroke={COLOR_SELECTION}
        anchorStroke={COLOR_SELECTION}
        anchorFill="#fff"
      />

      {/* Rubber-band Selection Box */}
      {selectionBox && (
        <Rect
          x={Math.min(selectionBox.x1, selectionBox.x2)}
          y={Math.min(selectionBox.y1, selectionBox.y2)}
          width={Math.abs(selectionBox.x2 - selectionBox.x1)}
          height={Math.abs(selectionBox.y2 - selectionBox.y1)}
          fill="rgba(0, 168, 255, 0.1)"
          stroke={COLOR_SELECTION}
          strokeWidth={1}
          dash={[5, 5]}
        />
      )}
    </>
  );
};

export default SelectionOverlay;
