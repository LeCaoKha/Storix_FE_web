import React from "react";
import { Rect, Group } from "react-konva";
import {
  GRID_SIZE,
  COLOR_ZONE_BG,
  COLOR_SHELF,
  COLOR_SELECTION,
} from "../constants";

/**
 * Renders all zones and their nested shelves on the canvas.
 * Optimized to handle multi-element movement and precise coordinate snapping.
 */
const ZoneLayer = ({
  zones,
  selectedIds,
  designMode,
  handleSelect,
  saveToHistory,
}) => {
  // --- CHỈNH SỬA VỊ TRÍ ZONE ---
  const handleZoneDragEnd = (e, zoneId) => {
    // Chỉ xử lý nếu đối tượng kéo là chính nó (tránh bubble từ shelf)
    if (e.target.id() !== zoneId) return;

    const nextZones = zones.map((z) => {
      if (z.id === zoneId) {
        return {
          ...z,
          x: Math.round(e.target.x() / GRID_SIZE) * GRID_SIZE,
          y: Math.round(e.target.y() / GRID_SIZE) * GRID_SIZE,
        };
      }
      return z;
    });
    saveToHistory(nextZones);
  };

  // --- THAY ĐỔI KÍCH THƯỚC ZONE ---
  const handleZoneTransformEnd = (e, zoneId) => {
    const node = e.target;
    const nextZones = zones.map((z) => {
      if (z.id === zoneId) {
        return {
          ...z,
          x: Math.round(node.x() / GRID_SIZE) * GRID_SIZE,
          y: Math.round(node.y() / GRID_SIZE) * GRID_SIZE,
          width: Math.max(
            GRID_SIZE,
            Math.round((node.width() * node.scaleX()) / GRID_SIZE) * GRID_SIZE,
          ),
          height: Math.max(
            GRID_SIZE,
            Math.round((node.height() * node.scaleY()) / GRID_SIZE) * GRID_SIZE,
          ),
        };
      }
      return z;
    });
    // Reset scale về 1 để tránh lỗi hiển thị của Konva
    node.scaleX(1);
    node.scaleY(1);
    saveToHistory(nextZones);
  };

  // --- CHỈNH SỬA VỊ TRÍ SHELF (SỬA LỖI MOVE SAI VỊ TRÍ) ---
  const handleShelfDragEnd = (e, zoneId, shelfId) => {
    // Ngăn chặn sự kiện lan lên Zone cha
    e.cancelBubble = true;

    const nextZones = zones.map((zone) => {
      if (zone.id === zoneId) {
        return {
          ...zone,
          shelves: zone.shelves.map((sh) => {
            if (sh.id === shelfId) {
              return {
                ...sh,
                x: Math.round(e.target.x() / GRID_SIZE) * GRID_SIZE,
                y: Math.round(e.target.y() / GRID_SIZE) * GRID_SIZE,
              };
            }
            return sh;
          }),
        };
      }
      return zone;
    });
    saveToHistory(nextZones);
  };

  // --- THAY ĐỔI KÍCH THƯỚC SHELF ---
  const handleShelfTransformEnd = (e, zoneId, shelfId) => {
    e.cancelBubble = true;
    const node = e.target;

    const nextZones = zones.map((zone) => {
      if (zone.id === zoneId) {
        return {
          ...zone,
          shelves: zone.shelves.map((sh) => {
            if (sh.id === shelfId) {
              return {
                ...sh,
                x: Math.round(node.x() / GRID_SIZE) * GRID_SIZE,
                y: Math.round(node.y() / GRID_SIZE) * GRID_SIZE,
                width: Math.max(
                  GRID_SIZE,
                  Math.round((node.width() * node.scaleX()) / GRID_SIZE) *
                    GRID_SIZE,
                ),
                height: Math.max(
                  GRID_SIZE,
                  Math.round((node.height() * node.scaleY()) / GRID_SIZE) *
                    GRID_SIZE,
                ),
              };
            }
            return sh;
          }),
        };
      }
      return zone;
    });
    node.scaleX(1);
    node.scaleY(1);
    saveToHistory(nextZones);
  };

  return (
    <>
      {zones.map((z) => (
        <Group key={z.id}>
          {/* Vùng Zone (Khu vực) */}
          <Rect
            id={z.id}
            x={z.x}
            y={z.y}
            width={z.width}
            height={z.height}
            fill={COLOR_ZONE_BG}
            stroke={selectedIds.includes(z.id) ? COLOR_SELECTION : "#bdc3c7"}
            strokeWidth={selectedIds.includes(z.id) ? 2 : 1}
            dash={selectedIds.includes(z.id) ? [] : [5, 5]} // Nét đứt nếu không chọn để phân biệt
            draggable={designMode === "OBJECT"}
            onClick={(e) => handleSelect(e, z.id)}
            onDragEnd={(e) => handleZoneDragEnd(e, z.id)}
            onTransformEnd={(e) => handleZoneTransformEnd(e, z.id)}
          />

          {/* Nhóm Kệ bên trong Zone */}
          {/* Tọa độ của Group này chính là tọa độ của Zone, giúp Shelf dùng tọa độ tương đối (Local) */}
          <Group x={z.x} y={z.y}>
            {z.shelves.map((s) => (
              <Rect
                key={s.id}
                id={s.id}
                x={s.x}
                y={s.y}
                width={s.width}
                height={s.height}
                fill={COLOR_SHELF}
                stroke={
                  selectedIds.includes(s.id) ? COLOR_SELECTION : "transparent"
                }
                strokeWidth={2}
                cornerRadius={2} // Bo góc nhẹ cho kệ trông đẹp hơn
                draggable={designMode === "OBJECT"}
                onClick={(e) => handleSelect(e, s.id)}
                onDragEnd={(e) => handleShelfDragEnd(e, z.id, s.id)}
                onTransformEnd={(e) => handleShelfTransformEnd(e, z.id, s.id)}
              />
            ))}
          </Group>
        </Group>
      ))}
    </>
  );
};

export default ZoneLayer;
