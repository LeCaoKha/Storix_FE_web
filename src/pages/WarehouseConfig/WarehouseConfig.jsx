import React, { useState, useRef, useEffect, useCallback } from "react";
import { Stage, Layer } from "react-konva";

// Constants
import { GRID_SIZE } from "./constants";

// Custom Hooks
import useWarehouseHistory from "./hooks/useWarehouseHistory";
import useWarehouseActions from "./hooks/useWarehouseActions";
import useStageEvents from "./hooks/useStageEvents";

// Components
import Sidebar from "./components/Sidebar";
import WarehouseGrid from "./components/WarehouseGrid";
import ZoneLayer from "./components/ZoneLayer";
import NavigationLayer from "./components/NavigationLayer";
import SelectionOverlay from "./components/SelectionOverlay";

const WarehouseConfiguration = () => {
  // --- CORE STATES ---
  const [navNodes, setNavNodes] = useState([]);
  const [navEdges, setNavEdges] = useState([]);
  const [designMode, setDesignMode] = useState("OBJECT");
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [whSize, setWhSize] = useState({
    width: 200 * GRID_SIZE,
    height: 100 * GRID_SIZE,
  });
  const [stageConfig, setStageConfig] = useState({
    scale: 0.5,
    x: 50,
    y: 50,
  });

  // --- REFS ---
  const stageRef = useRef();
  const trRef = useRef();
  const lastSelectedNodeIdRef = useRef(null);

  // --- CUSTOM HOOKS ---
  const { zones, saveToHistory, undo } = useWarehouseHistory();

  const { addZone, addShelf, deleteItems } = useWarehouseActions({
    zones,
    saveToHistory,
    undo,
    selectedIds,
    setSelectedIds,
    setNavNodes,
    setNavEdges,
    setActiveNodeId,
  });

  const {
    selectionBox,
    handleSelect,
    onStageMouseDown,
    onStageMouseMove,
    onStageMouseUp,
  } = useStageEvents({
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
  });

  // --- EXPORT CONFIG ---
  const exportWarehouseConfig = useCallback(() => {
    const configData = {
      version: "3.0",
      exportDate: new Date().toISOString(),
      metadata: {
        name: "Warehouse Layout",
        gridSize: GRID_SIZE,
      },
      canvas: {
        width: whSize.width,
        height: whSize.height,
        unit: "meter",
      },
      layout: zones,
      navigation: {
        nodes: navNodes,
        edges: navEdges,
      },
    };

    const dataStr = JSON.stringify(configData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `warehouse_config_${Date.now()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }, [zones, navNodes, navEdges, whSize]);

  // --- SYNC TRANSFORMER WITH SELECTED NODES ---
  useEffect(() => {
    if (trRef.current) {
      const stage = stageRef.current;
      const nodes = selectedIds
        .map((id) => stage.findOne(`#${id}`))
        .filter(Boolean);
      trRef.current.nodes(nodes);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedIds, zones, navNodes]);

  // --- WHEEL ZOOM ---
  const handleWheel = useCallback((e) => {
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newScale = e.evt.deltaY < 0 ? oldScale * 1.1 : oldScale / 1.1;
    if (newScale > 0.1 && newScale < 5) {
      setStageConfig({
        scale: newScale,
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
    }
  }, []);

  // --- RENDER ---
  return (
    <div className="!flex !w-full !h-screen !overflow-hidden !bg-slate-100">
      {/* SIDEBAR */}
      <Sidebar
        designMode={designMode}
        setDesignMode={setDesignMode}
        setActiveNodeId={setActiveNodeId}
        whSize={whSize}
        setWhSize={setWhSize}
        addZone={addZone}
        addShelf={addShelf}
        deleteItems={deleteItems}
        undo={undo}
        exportWarehouseConfig={exportWarehouseConfig}
        selectedIds={selectedIds}
      />

      {/* CANVAS STAGE */}
      <div className="!flex-1 !relative !bg-slate-200 !overflow-hidden">
        <Stage
          ref={stageRef}
          width={window.innerWidth - 288} // 288 = 72 (sidebar width in rem converted to px approx)
          height={window.innerHeight}
          scaleX={stageConfig.scale}
          scaleY={stageConfig.scale}
          x={stageConfig.x}
          y={stageConfig.y}
          draggable={designMode === "OBJECT"}
          onMouseDown={onStageMouseDown}
          onMouseMove={onStageMouseMove}
          onMouseUp={onStageMouseUp}
          onWheel={handleWheel}
        >
          <Layer>
            {/* Grid Background */}
            <WarehouseGrid whSize={whSize} />

            {/* Zones & Shelves */}
            <ZoneLayer
              zones={zones}
              selectedIds={selectedIds}
              designMode={designMode}
              handleSelect={handleSelect}
              saveToHistory={saveToHistory}
            />

            {/* Navigation Nodes & Edges */}
            <NavigationLayer
              navNodes={navNodes}
              navEdges={navEdges}
              designMode={designMode}
              selectedIds={selectedIds}
              activeNodeId={activeNodeId}
              handleSelect={handleSelect}
            />

            {/* Transformer & Selection Box */}
            <SelectionOverlay trRef={trRef} selectionBox={selectionBox} />
          </Layer>
        </Stage>

        {/* Stage Size Indicator */}
        <div className="!absolute !bottom-4 !right-4 !bg-white/90 !backdrop-blur-sm !px-4 !py-2 !rounded-xl !shadow-lg !border !border-slate-100">
          <p className="!text-xs !font-bold !text-slate-500">
            Canvas: {whSize.width} × {whSize.height} units
          </p>
        </div>
      </div>
    </div>
  );
};

export default WarehouseConfiguration;
