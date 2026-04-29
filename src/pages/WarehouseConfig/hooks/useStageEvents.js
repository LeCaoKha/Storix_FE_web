import { useState, useCallback } from "react";
import { GRID_SIZE } from "../constants";

/**
 * Custom hook for stage mouse events: selection box, navigation click,
 * and node connection logic.
 *
 * Interaction logic:
 * - Ctrl + MouseDown → Start selection box (marquee)
 * - MouseDown only on empty area → Let Konva handle drag (panning)
 * - MouseDown on element → Drag element (handled by Konva's draggable)
 * - Drag outside canvas → Auto-pan (handled by Konva)
 */
const useStageEvents = ({
  stageRef,
  designMode,
  zones,
  navNodes,
  setNavNodes,
  navEdges,
  setNavEdges,
  setSelectedIds,
  activeNodeId,
  setActiveNodeId,
  lastSelectedNodeIdRef,
}) => {
  const [selectionBox, setSelectionBox] = useState(null);

  // --- HANDLE SELECT (single or multi with Shift) ---
  const handleSelect = useCallback(
    (e, id) => {
      e.cancelBubble = true;
      if (e.evt.shiftKey) {
        setSelectedIds((prev) =>
          prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
      } else {
        setSelectedIds([id]);
      }

      if (id.startsWith("NODE-")) {
        lastSelectedNodeIdRef.current = id;
        setActiveNodeId(id);
      }
    },
    [setSelectedIds, setActiveNodeId, lastSelectedNodeIdRef],
  );

  // --- NAVIGATION: Create new node ---
  const handleNavClick = useCallback(
    (pos) => {
      const newNodeId = `NODE-${Date.now()}`;
      const newNode = {
        id: newNodeId,
        x: Math.round(pos.x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(pos.y / GRID_SIZE) * GRID_SIZE,
        type: "waypoint",
      };
      setNavNodes((prev) => [...prev, newNode]);
      setSelectedIds([newNodeId]);
      lastSelectedNodeIdRef.current = newNodeId;
      setActiveNodeId(newNodeId);
    },
    [setNavNodes, setSelectedIds, setActiveNodeId, lastSelectedNodeIdRef],
  );

  // --- NAVIGATION: Connect two nodes ---
  const connectNavNodes = useCallback(
    (fromId, toId) => {
      if (!fromId || !toId || fromId === toId) return;
      const exists = navEdges.some(
        (e) =>
          (e.from === fromId && e.to === toId) ||
          (e.from === toId && e.to === fromId),
      );
      if (!exists) {
        setNavEdges((prev) => [
          ...prev,
          { id: `EDGE-${Date.now()}`, from: fromId, to: toId },
        ]);
      }
    },
    [navEdges, setNavEdges],
  );

  // --- STAGE MOUSE DOWN ---
  const onStageMouseDown = useCallback(
    (e) => {
      const stage = stageRef.current;
      const clickedItem = e.target;
      const pos = stage.getPointerPosition();
      const transform = stage.getAbsoluteTransform().copy().invert();
      const localPos = transform.point(pos);

      // NAVIGATION MODE
      if (designMode === "NAV") {
        const nodeId = clickedItem.getParent()?.attrs?.id;

        if (nodeId && nodeId.startsWith("NODE-")) {
          if (e.evt.shiftKey && activeNodeId && activeNodeId !== nodeId) {
            connectNavNodes(activeNodeId, nodeId);
          }
          handleSelect(e, nodeId);
        } else {
          const isFloor = clickedItem.id() === "warehouse-floor";
          const isZone =
            clickedItem.attrs.id && clickedItem.attrs.id.startsWith("ZONE-");

          if (clickedItem === stage || isFloor || isZone) {
            handleNavClick(localPos);
          }
        }
        return;
      }

      // OBJECT MODE: Start selection box on left click + Ctrl on empty area
      if (e.evt.ctrlKey && e.target === stage) {
        setSelectionBox({
          x1: localPos.x,
          y1: localPos.y,
          x2: localPos.x,
          y2: localPos.y,
        });
        if (!e.evt.shiftKey) setSelectedIds([]);
      }
      // If no Ctrl key, don't start selection box - let Konva handle drag
    },
    [
      stageRef,
      designMode,
      activeNodeId,
      connectNavNodes,
      handleSelect,
      handleNavClick,
      setSelectedIds,
    ],
  );

  // --- STAGE MOUSE MOVE ---
  const onStageMouseMove = useCallback(() => {
    if (!selectionBox) return;

    const stage = stageRef.current;
    const pos = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy().invert();
    const localPos = transform.point(pos);
    setSelectionBox((prev) => ({ ...prev, x2: localPos.x, y2: localPos.y }));
  }, [selectionBox, stageRef]);

  // --- STAGE MOUSE UP ---
  const onStageMouseUp = useCallback(() => {
    // Only process selection box if it exists
    if (!selectionBox) return;

    const box = {
      x: Math.min(selectionBox.x1, selectionBox.x2),
      y: Math.min(selectionBox.y1, selectionBox.y2),
      w: Math.abs(selectionBox.x2 - selectionBox.x1),
      h: Math.abs(selectionBox.y2 - selectionBox.y1),
    };

    // Don't select if the box is too small (just a click)
    if (box.w < 5 && box.h < 5) {
      setSelectionBox(null);
      return;
    }

    const foundIds = [];
    zones.forEach((z) => {
      if (
        z.x >= box.x &&
        z.x + z.width <= box.x + box.w &&
        z.y >= box.y &&
        z.y + z.height <= box.y + box.h
      )
        foundIds.push(z.id);
      z.shelves.forEach((s) => {
        const absX = z.x + s.x;
        const absY = z.y + s.y;
        if (
          absX >= box.x &&
          absX + s.width <= box.x + box.w &&
          absY >= box.y &&
          absY + s.height <= box.y + box.h
        )
          foundIds.push(s.id);
      });
    });
    navNodes.forEach((n) => {
      if (
        n.x >= box.x &&
        n.x <= box.x + box.w &&
        n.y >= box.y &&
        n.y <= box.y + box.h
      )
        foundIds.push(n.id);
    });
    setSelectedIds((prev) => [...new Set([...prev, ...foundIds])]);
    setSelectionBox(null);
  }, [selectionBox, zones, navNodes, setSelectedIds]);

  return {
    selectionBox,
    handleSelect,
    onStageMouseDown,
    onStageMouseMove,
    onStageMouseUp,
  };
};

export default useStageEvents;
