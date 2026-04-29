import { useState, useCallback, useEffect, useRef } from "react";
import { GRID_SIZE } from "../constants";

/**
 * Custom hook for warehouse CRUD operations: add zone, add shelf,
 * delete, copy, paste, and keyboard shortcuts.
 */
const useWarehouseActions = ({
  zones,
  saveToHistory,
  undo,
  selectedIds,
  setSelectedIds,
  setNavNodes,
  setNavEdges,
  setActiveNodeId,
}) => {
  // Clipboard bây giờ sẽ lưu { items, refX, refY }
  // const [clipboard, setClipboard] = useState({ items: [], refX: 0, refY: 0 });
  // Use ref to track copy count to ensure fresh snapshots
  // const copyCountRef = useRef(0);
  const clipboardRef = useRef({ items: [], minX: 0, minY: 0 });

  // --- ADD ZONE ---
  const addZone = useCallback(() => {
    const newId = `ZONE-${Date.now()}`;
    const newZone = {
      id: newId,
      name: "Khu mới",
      x: 80,
      y: 80,
      width: 320,
      height: 240,
      shelves: [],
    };
    saveToHistory([...zones, newZone]);
    setSelectedIds([newId]);
  }, [zones, saveToHistory, setSelectedIds]);

  // --- ADD SHELF ---
  const addShelf = useCallback(() => {
    const targetZoneId =
      zones.find((z) => selectedIds.includes(z.id))?.id || zones[0]?.id;
    if (!targetZoneId) return alert("Hãy chọn hoặc tạo một Zone trước!");
    const newShelfId = `SH-${Date.now()}`;
    const nextZones = zones.map((z) =>
      z.id === targetZoneId
        ? {
            ...z,
            shelves: [
              ...z.shelves,
              { id: newShelfId, x: 40, y: 40, width: 80, height: 40 },
            ],
          }
        : z,
    );
    saveToHistory(nextZones);
    setSelectedIds([newShelfId]);
  }, [zones, selectedIds, saveToHistory, setSelectedIds]);

  // --- DELETE ITEMS ---
  const deleteItems = useCallback(() => {
    const nextZones = zones
      .map((z) => ({
        ...z,
        shelves: z.shelves.filter((s) => !selectedIds.includes(s.id)),
      }))
      .filter((z) => !selectedIds.includes(z.id));

    setNavNodes((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
    setNavEdges((prev) =>
      prev.filter(
        (e) => !selectedIds.includes(e.from) && !selectedIds.includes(e.to),
      ),
    );
    saveToHistory(nextZones);
    setSelectedIds([]);
    setActiveNodeId(null);
  }, [
    zones,
    selectedIds,
    saveToHistory,
    setSelectedIds,
    setNavNodes,
    setNavEdges,
    setActiveNodeId,
  ]);
  // --- COPY ---
  // Creates a deep independent snapshot of selected elements
  const copyItems = useCallback(() => {
    if (selectedIds.length === 0) return;

    let minX = Infinity,
      minY = Infinity;
    const itemsToCopy = [];

    // Tìm điểm gốc dựa trên vị trí thực tế TRÊN MÀN HÌNH (Absolute)
    zones.forEach((z) => {
      if (selectedIds.includes(z.id)) {
        minX = Math.min(minX, z.x);
        minY = Math.min(minY, z.y);
      }
      z.shelves.forEach((s) => {
        if (selectedIds.includes(s.id)) {
          const absX = z.x + s.x;
          const absY = z.y + s.y;
          minX = Math.min(minX, absX);
          minY = Math.min(minY, absY);
        }
      });
    });

    zones.forEach((z) => {
      if (selectedIds.includes(z.id)) {
        itemsToCopy.push({
          type: "ZONE",
          data: JSON.parse(JSON.stringify(z)),
          relX: z.x - minX,
          relY: z.y - minY,
        });
      }
      z.shelves.forEach((s) => {
        if (selectedIds.includes(s.id) && !selectedIds.includes(z.id)) {
          itemsToCopy.push({
            type: "SHELF",
            data: JSON.parse(JSON.stringify(s)),
            relX: z.x + s.x - minX,
            relY: z.y + s.y - minY,
            lastKnownZoneId: z.id, // Lưu lại zone cũ để tham chiếu nếu cần
          });
        }
      });
    });

    clipboardRef.current = { items: itemsToCopy, minX, minY };
  }, [selectedIds, zones]);
  // --- PASTE ---
  // Always uses the stored snapshot, independent of current zones state
  const pasteItems = useCallback(() => {
    const { items, minX, minY } = clipboardRef.current;
    if (items.length === 0) return;

    let nextZones = JSON.parse(JSON.stringify(zones));
    const newSelectedIds = [];
    const timestamp = Date.now();

    const targetBaseX = minX + GRID_SIZE;
    const targetBaseY = minY + GRID_SIZE;

    items.forEach((item, idx) => {
      const finalAbsX = targetBaseX + item.relX;
      const finalAbsY = targetBaseY + item.relY;

      if (item.type === "ZONE") {
        const newId = `ZONE-${timestamp}-${idx}`;
        nextZones.push({
          ...item.data,
          id: newId,
          x: finalAbsX,
          y: finalAbsY,
          shelves: item.data.shelves.map((s, si) => ({
            ...s,
            id: `SH-${timestamp}-${idx}-${si}`,
          })),
        });
        newSelectedIds.push(newId);
      } else if (item.type === "SHELF") {
        // Tìm Zone chứa vị trí dán (Sử dụng sai số 1px để tránh lệch Grid)
        const targetZone = nextZones.find(
          (z) =>
            finalAbsX >= z.x - 1 &&
            finalAbsX <= z.x + z.width + 1 &&
            finalAbsY >= z.y - 1 &&
            finalAbsY <= z.y + z.height + 1,
        );

        if (targetZone) {
          const newId = `SH-${timestamp}-${idx}`;
          targetZone.shelves.push({
            ...item.data,
            id: newId,
            x: finalAbsX - targetZone.x,
            y: finalAbsY - targetZone.y,
          });
          newSelectedIds.push(newId);
        }
        // Nếu không tìm thấy Zone, không làm gì cả (tránh văng kệ ra ngoài sàn)
      }
    });

    clipboardRef.current.minX = targetBaseX;
    clipboardRef.current.minY = targetBaseY;

    saveToHistory(nextZones);
    setSelectedIds(newSelectedIds);
  }, [zones, saveToHistory, setSelectedIds]);

  // --- KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT") return;
      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key === "c") {
        e.preventDefault();
        copyItems();
      }
      if (isCtrl && e.key === "v") {
        e.preventDefault();
        pasteItems();
      }

      // FIX LỖI CTRL + D: Gọi trực tiếp không qua setTimeout quá dài
      if (isCtrl && e.key === "d") {
        e.preventDefault();
        copyItems();
        setTimeout(pasteItems, 0); // Dùng setTimeout 0 để đảm bảo Ref đã update
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteItems();
      }
      if (e.key.toLowerCase() === "r") addShelf();
      if (e.key.toLowerCase() === "d" && !isCtrl) addZone();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, copyItems, pasteItems, deleteItems, addShelf, addZone]);

  return { addZone, addShelf, deleteItems, copyItems, pasteItems };
};

export default useWarehouseActions;
