import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Stage,
  Layer,
  Rect,
  Transformer,
  Line,
  Text,
  Group,
  Circle,
} from "react-konva";

// --- CẤU HÌNH HỆ THỐNG ---
const GRID_SIZE = 1; // 1 mét thực tế = 40px
const MAX_HISTORY = 50;
const COLOR_SELECTION = "#00a8ff"; // Xanh Cyan
const COLOR_ZONE_BG = "rgba(46, 204, 113, 0.1)";
const COLOR_SHELF = "#3498db";
const COLOR_NAV_NODE = "#f1c40f"; // Vàng cho điểm đi bộ

const WarehouseConfiguration = () => {
  // --- STATES QUẢN LÝ DỮ LIỆU ---
  const [zones, setZones] = useState([]); // Chứa Zones và Shelves
  const [navNodes, setNavNodes] = useState([]); // Điểm mốc di chuyển
  const [navEdges, setNavEdges] = useState([]); // Đường nối lối đi
  const [designMode, setDesignMode] = useState("OBJECT"); // "OBJECT" hoặc "NAV"
  const [selectedEntity, setSelectedEntity] = useState(null);

  // MỚI: State để hiển thị node đang chọn (giúp visual feedback tốt hơn ref)
  const [activeNodeId, setActiveNodeId] = useState(null);

  const [history, setHistory] = useState([[]]);
  const [historyStep, setHistoryStep] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectionBox, setSelectionBox] = useState(null);
  const [clipboard, setClipboard] = useState([]);
  const [whSize, setWhSize] = useState({
    width: 500 * GRID_SIZE,
    height: 300 * GRID_SIZE,
  });
  const [stageConfig, setStageConfig] = useState({ scale: 0.8, x: 50, y: 50 });

  const stageRef = useRef();
  const trRef = useRef();
  const lastSelectedNodeId = useRef(null);

  const exportWarehouseConfig = useCallback(() => {
    const configData = {
      version: "3.1", // Cập nhật phiên bản để phân biệt cấu trúc có Levels/Bins
      exportDate: new Date().toISOString(),
      metadata: {
        name: "Warehouse Layout Configuration",
        gridSize: GRID_SIZE,
        description: "Hệ thống lưu trữ phân cấp Shelf-Level-Bin",
      },
      canvas: {
        width: whSize.width,
        height: whSize.height,
        unit: "meter",
      },
      // Toàn bộ dữ liệu Zones bao gồm Shelves và Levels/Bins bên trong
      layout: zones,
      // Hệ thống đường đi di chuyển
      navigation: {
        nodes: navNodes,
        edges: navEdges,
      },
    };

    // Chuyển đổi đối tượng sang chuỗi JSON có định dạng thụt lề 2 khoảng trắng
    const dataStr = JSON.stringify(configData, null, 2);

    // Tạo URL từ Blob để trình duyệt có thể tải về
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Tạo tên file mặc định kèm mốc thời gian
    const fileName = `warehouse_config_${Date.now()}.json`;

    // Tạo phần tử <a> ẩn để kích hoạt lệnh tải xuống
    const linkElement = document.createElement("a");
    linkElement.href = url;
    linkElement.download = fileName;
    document.body.appendChild(linkElement);
    linkElement.click();

    // Dọn dẹp bộ nhớ sau khi tải xong
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);
  }, [zones, navNodes, navEdges, whSize]);

  const updateShelfProperty = (property, value) => {
    if (!selectedEntity) return;

    const nextZones = zones.map((z) => {
      if (z.id !== selectedEntity.zoneId) return z;
      return {
        ...z,
        shelves: z.shelves.map((s) =>
          s.id === selectedEntity.id ? { ...s, [property]: value } : s,
        ),
      };
    });

    setZones(nextZones);
    // Cập nhật ngay lập tức vào entity đang chọn để hiển thị lên Sidebar
    setSelectedEntity((prev) => ({ ...prev, [property]: value }));
    saveToHistory(nextZones);
  };

  // 2. Hàm thêm một Level mới vào Shelf
  const addLevel = () => {
    if (!selectedEntity) return;

    // Khởi tạo cấu trúc Level mới
    const newLevel = {
      id: `LV-${Date.now()}`,
      name: `Tầng ${(selectedEntity.levels?.length || 0) + 1}`,
      bins: [],
    };

    const updatedLevels = [...(selectedEntity.levels || []), newLevel];
    updateShelfProperty("levels", updatedLevels);
  };

  // 3. Hàm thêm một Bin vào một Level cụ thể
  const addBinToLevel = (levelId) => {
    if (!selectedEntity) return;

    const updatedLevels = selectedEntity.levels.map((lv) => {
      if (lv.id === levelId) {
        const newBin = {
          id: `BIN-${Date.now()}`,
          code: `B${lv.bins.length + 1}-${lv.name.replace(/\s/g, "")}`,
        };
        return { ...lv, bins: [...lv.bins, newBin] };
      }
      return lv;
    });

    updateShelfProperty("levels", updatedLevels);
  };

  // 4. Hàm xóa một Level
  const deleteLevel = (levelId) => {
    const updatedLevels = selectedEntity.levels.filter(
      (lv) => lv.id !== levelId,
    );
    updateShelfProperty("levels", updatedLevels);
  };

  const deleteBin = (levelId, binId) => {
    if (!selectedEntity) return;

    const updatedLevels = selectedEntity.levels.map((lv) => {
      if (lv.id === levelId) {
        // Lọc bỏ bin có id tương ứng
        const filteredBins = lv.bins.filter((b) => b.id !== binId);
        return { ...lv, bins: filteredBins };
      }
      return lv;
    });

    updateShelfProperty("levels", updatedLevels);
  };

  // --- LOGIC LỊCH SỬ (UNDO) ---
  const saveToHistory = useCallback(
    (newZones) => {
      setHistory((prev) => {
        const next = prev.slice(0, historyStep + 1);
        const updated = [...next, JSON.parse(JSON.stringify(newZones))];
        return updated.slice(-MAX_HISTORY);
      });
      setHistoryStep((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
      setZones(newZones);
    },
    [historyStep],
  );

  const undo = useCallback(() => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1;
      setHistoryStep(prevStep);
      setZones(JSON.parse(JSON.stringify(history[prevStep])));
      setSelectedIds([]);
    }
  }, [history, historyStep]);

  const updateShelfSize = (dim, value) => {
    if (!selectedEntity) return;
    const val = Number(value);

    const nextZones = zones.map((z) => {
      if (z.id !== selectedEntity.zoneId) return z;
      return {
        ...z,
        shelves: z.shelves.map((s) =>
          s.id === selectedEntity.id ? { ...s, [dim]: val } : s,
        ),
      };
    });

    setZones(nextZones);
    setSelectedEntity((prev) => ({ ...prev, [dim]: val })); // Cập nhật local state để input mượt mà
    saveToHistory(nextZones);
  };

  // --- QUẢN LÝ SELECTION (CHỌN NHIỀU) ---
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

  const handleSelect = (e, id) => {
    e.cancelBubble = true;
    const isShift = e.evt.shiftKey;

    setSelectedIds((prev) =>
      isShift
        ? prev.includes(id)
          ? prev.filter((i) => i !== id)
          : [...prev, id]
        : [id],
    );

    // Tìm đối tượng shelf để sửa kích thước
    let foundShelf = null;
    zones.forEach((z) => {
      const s = z.shelves.find((sh) => sh.id === id);
      if (s) foundShelf = { ...s, zoneId: z.id };
    });

    setSelectedEntity(foundShelf); // Nếu click vào Zone hoặc Node thì entity này sẽ là null

    if (id.startsWith("NODE-")) {
      lastSelectedNodeId.current = id;
      setActiveNodeId(id);
    }
  };

  // --- NAVIGATION LOGIC (VẼ ĐƯỜNG ĐI) ---
  const handleNavClick = (pos) => {
    const newNodeId = `NODE-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      x: Math.round(pos.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(pos.y / GRID_SIZE) * GRID_SIZE,
      type: "waypoint",
    };
    setNavNodes((prev) => [...prev, newNode]);
    setSelectedIds([newNodeId]);
    lastSelectedNodeId.current = newNodeId;
    setActiveNodeId(newNodeId);
  };

  const connectNavNodes = (fromId, toId) => {
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
  };

  // --- STAGE EVENTS ---
  const onStageMouseDown = (e) => {
    const stage = stageRef.current;
    const clickedItem = e.target;

    // Chuyển đổi tọa độ chuột sang tọa độ thực tế (Local Position)
    const pos = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy().invert();
    const localPos = transform.point(pos);

    // --- CHẾ ĐỘ NAVIGATION (ĐƯỜNG ĐI) ---
    if (designMode === "NAV") {
      const nodeId = clickedItem.getParent()?.attrs?.id || clickedItem.attrs.id;

      // Nếu click trúng Node cũ
      if (
        nodeId &&
        (nodeId.startsWith("NODE-") || nodeId.startsWith("node-"))
      ) {
        if (e.evt.shiftKey && activeNodeId && activeNodeId !== nodeId) {
          connectNavNodes(activeNodeId, nodeId);
        }
        handleSelect(e, nodeId);
      } else {
        // KIỂM TRA: Chỉ tạo Node nếu click TRONG phạm vi sàn kho
        const isInside =
          localPos.x >= 0 &&
          localPos.x <= whSize.width &&
          localPos.y >= 0 &&
          localPos.y <= whSize.height;

        if (isInside) {
          handleNavClick(localPos);
        }
        // Nếu ngoài sàn kho: Không làm gì cả để Stage tự Drag
      }
      return;
    }

    // --- CHẾ ĐỘ OBJECT (VẬT THỂ) ---

    // Quan trọng: Nếu click vào vùng xám (Stage), hủy selectionBox để Stage có thể Drag
    if (clickedItem === stage) {
      setSelectionBox(null);
      if (!e.evt.shiftKey) {
        setSelectedIds([]);
        setSelectedEntity(null);
      }
      return;
    }

    // Nếu click vào Sàn kho hoặc Vật thể cụ thể: Khởi tạo Selection Box
    if (clickedItem.id() === "warehouse-floor" || clickedItem instanceof Rect) {
      setSelectionBox({
        x1: localPos.x,
        y1: localPos.y,
        x2: localPos.x,
        y2: localPos.y,
      });

      if (!e.evt.shiftKey) {
        setSelectedIds([]);
        setSelectedEntity(null);
      }
    }
  };

  const onStageMouseMove = (e) => {
    // Nếu không có selectionBox (đang Drag Stage), không làm gì cả
    if (!selectionBox) return;

    const stage = stageRef.current;
    const pos = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy().invert();
    const localPos = transform.point(pos);

    setSelectionBox((prev) => ({
      ...prev,
      x2: localPos.x,
      y2: localPos.y,
    }));
  };

  const onStageMouseUp = () => {
    if (!selectionBox) return;

    const box = {
      x: Math.min(selectionBox.x1, selectionBox.x2),
      y: Math.min(selectionBox.y1, selectionBox.y2),
      w: Math.abs(selectionBox.x2 - selectionBox.x1),
      h: Math.abs(selectionBox.y2 - selectionBox.y1),
    };

    const foundIds = [];

    // Quét Zones
    zones.forEach((z) => {
      if (
        z.x >= box.x &&
        z.x + z.width <= box.x + box.w &&
        z.y >= box.y &&
        z.y + z.height <= box.y + box.h
      ) {
        foundIds.push(z.id);
      }
      // Quét Shelves bên trong Zones
      z.shelves.forEach((s) => {
        const absX = z.x + s.x;
        const absY = z.y + s.y;
        if (
          absX >= box.x &&
          absX + s.width <= box.x + box.w &&
          absY >= box.y &&
          absY + s.height <= box.y + box.h
        ) {
          foundIds.push(s.id);
        }
      });
    });

    // Quét NavNodes
    navNodes.forEach((n) => {
      if (
        n.x >= box.x &&
        n.x <= box.x + box.w &&
        n.y >= box.y &&
        n.y <= box.y + box.h
      ) {
        foundIds.push(n.id);
      }
    });

    if (foundIds.length > 0) {
      setSelectedIds((prev) => [...new Set([...prev, ...foundIds])]);
    }

    setSelectionBox(null);
  };

  // --- CRUD FUNCTIONS ---
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
  }, [zones, saveToHistory]);

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
  }, [zones, selectedIds, saveToHistory]);

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
  }, [zones, selectedIds, saveToHistory]);

  // --- COPY / PASTE / HOTKEYS ---
  const copyItems = useCallback(() => {
    const items = [];
    zones.forEach((z) => {
      if (selectedIds.includes(z.id))
        items.push({ type: "ZONE", data: JSON.parse(JSON.stringify(z)) });
      z.shelves.forEach((s) => {
        if (selectedIds.includes(s.id))
          items.push({
            type: "SHELF",
            data: JSON.parse(JSON.stringify(s)),
            parentZoneId: z.id,
          });
      });
    });
    if (items.length > 0) setClipboard(items);
  }, [selectedIds, zones]);

  const pasteItems = useCallback(() => {
    if (clipboard.length === 0) return;
    let nextZones = JSON.parse(JSON.stringify(zones));
    const newSelectedIds = [];
    clipboard.forEach((item) => {
      const offset = GRID_SIZE;
      if (item.type === "ZONE") {
        const newId = `ZONE-${Date.now()}-${Math.random()}`;
        nextZones.push({
          ...item.data,
          id: newId,
          x: item.data.x + offset,
          y: item.data.y + offset,
          shelves: item.data.shelves.map((s) => ({
            ...s,
            id: `SH-${Math.random()}`,
          })),
        });
        newSelectedIds.push(newId);
      } else {
        const targetZone =
          nextZones.find((z) => z.id === item.parentZoneId) || nextZones[0];
        if (targetZone) {
          const newId = `SH-${Date.now()}-${Math.random()}`;
          targetZone.shelves.push({
            ...item.data,
            id: newId,
            x: item.data.x + offset,
            y: item.data.y + offset,
          });
          newSelectedIds.push(newId);
        }
      }
    });
    saveToHistory(nextZones);
    setSelectedIds(newSelectedIds);
  }, [clipboard, zones, saveToHistory]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT") return;
      const isCtrl = e.ctrlKey || e.metaKey;
      if (isCtrl && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if (isCtrl && e.key === "c") {
        e.preventDefault();
        copyItems();
      }
      if (isCtrl && e.key === "v") {
        e.preventDefault();
        pasteItems();
      }
      if (isCtrl && e.key === "d") {
        e.preventDefault();
        copyItems();
        setTimeout(pasteItems, 10);
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

  // --- RENDER ---
  return (
    <div style={containerStyle}>
      {/* SIDEBAR */}
      <div style={sidebarStyle}>
        <h2 style={{ color: "#2c3e50", marginBottom: "20px" }}>
          Storix Pro v3
        </h2>

        <div style={panelStyle}>
          <p style={labelTitle}>
            Chế độ: <span style={{ color: COLOR_SELECTION }}>{designMode}</span>
          </p>
          <div style={{ display: "flex", gap: "5px" }}>
            <button
              style={{
                ...modeBtn,
                backgroundColor:
                  designMode === "OBJECT" ? COLOR_SELECTION : "#eee",
              }}
              onClick={() => {
                setDesignMode("OBJECT");
                setActiveNodeId(null);
              }}
            >
              Vật thể
            </button>
            <button
              style={{
                ...modeBtn,
                backgroundColor:
                  designMode === "NAV" ? COLOR_SELECTION : "#eee",
              }}
              onClick={() => setDesignMode("NAV")}
            >
              Đường đi
            </button>
          </div>
        </div>

        <div style={panelStyle}>
          <p style={labelTitle}>Kho (mét)</p>
          <div style={{ display: "flex", gap: "5px" }}>
            <input
              type="number"
              style={inputStyle}
              value={whSize.width / GRID_SIZE}
              onChange={(e) =>
                setWhSize({
                  ...whSize,
                  width: Number(e.target.value) * GRID_SIZE,
                })
              }
            />
            <input
              type="number"
              style={inputStyle}
              value={whSize.height / GRID_SIZE}
              onChange={(e) =>
                setWhSize({
                  ...whSize,
                  height: Number(e.target.value) * GRID_SIZE,
                })
              }
            />
          </div>
          {selectedEntity && (
            <div style={panelStyle}>
              <p style={labelTitle}>Kích thước Kệ (SH-ID)</p>
              <div style={{ display: "flex", gap: "5px", marginBottom: "5px" }}>
                <div style={{ flex: 1 }}>
                  <small>Rộng (m)</small>
                  <input
                    type="number"
                    style={inputStyle}
                    value={selectedEntity.width}
                    onChange={(e) => updateShelfSize("width", e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <small>Dài (m)</small>
                  <input
                    type="number"
                    style={inputStyle}
                    value={selectedEntity.height}
                    onChange={(e) => updateShelfSize("height", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <button style={btnStyle} onClick={addZone}>
          [D] Thêm Zone
        </button>
        <button
          style={{ ...btnStyle, backgroundColor: "#27ae60" }}
          onClick={addShelf}
        >
          [R] Thêm Kệ
        </button>
        <button
          style={{ ...btnStyle, backgroundColor: "#e74c3c" }}
          onClick={deleteItems}
          disabled={selectedIds.length === 0}
        >
          Xóa chọn
        </button>
        <button
          style={{ ...btnStyle, backgroundColor: "#3498db" }}
          onClick={undo}
        >
          Ctrl+Z (Undo)
        </button>
        {/* Thêm vào bên dưới nút Ctrl+Z (Undo) */}
        <button
          style={{ ...btnStyle, backgroundColor: "#9b59b6", marginTop: "10px" }}
          onClick={exportWarehouseConfig}
        >
          Xuất cấu hình (JSON)
        </button>

        <div style={helpBox}>
          <p>
            <b>HD Vẽ đường:</b>
          </p>
          <p style={{ fontSize: "11px" }}>
            1. Click vùng trống: Tạo Node
            <br />
            2. Shift + Click: Nối 2 Node
          </p>
        </div>
      </div>

      {/* STAGE */}
      <div style={{ flex: 1, backgroundColor: "#dcdde1", overflow: "hidden" }}>
        <Stage
          ref={stageRef}
          width={window.innerWidth - 260}
          height={window.innerHeight}
          scaleX={stageConfig.scale}
          scaleY={stageConfig.scale}
          x={stageConfig.x}
          y={stageConfig.y}
          draggable={designMode === "OBJECT" && !selectionBox}
          onMouseDown={onStageMouseDown}
          onMouseMove={onStageMouseMove}
          onMouseUp={onStageMouseUp}
          onWheel={(e) => {
            const stage = stageRef.current;
            const oldScale = stage.scaleX();
            const pointer = stage.getPointerPosition();
            const mousePointTo = {
              x: (pointer.x - stage.x()) / oldScale,
              y: (pointer.y - stage.y()) / oldScale,
            };
            const newScale = e.evt.deltaY < 0 ? oldScale * 1.1 : oldScale / 1.1;
            if (newScale > 0.1 && newScale < 5)
              setStageConfig({
                scale: newScale,
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
              });
          }}
        >
          <Layer>
            <Rect
              id="warehouse-floor"
              width={whSize.width}
              height={whSize.height}
              fill="#fff"
              shadowBlur={5}
            />
            {/* Grid */}
            {[...Array(Math.floor(whSize.width / GRID_SIZE) + 1)].map(
              (_, i) => (
                <Line
                  key={`v-${i}`}
                  points={[i * GRID_SIZE, 0, i * GRID_SIZE, whSize.height]}
                  stroke="#f1f2f6"
                  strokeWidth={1}
                />
              ),
            )}
            {[...Array(Math.floor(whSize.height / GRID_SIZE) + 1)].map(
              (_, i) => (
                <Line
                  key={`h-${i}`}
                  points={[0, i * GRID_SIZE, whSize.width, i * GRID_SIZE]}
                  stroke="#f1f2f6"
                  strokeWidth={1}
                />
              ),
            )}

            {/* ZONES & SHELVES */}
            {zones.map((z) => (
              <Group key={z.id}>
                <Rect
                  id={z.id}
                  {...z}
                  fill={COLOR_ZONE_BG}
                  stroke={
                    selectedIds.includes(z.id) ? COLOR_SELECTION : "#bdc3c7"
                  }
                  strokeWidth={selectedIds.includes(z.id) ? 2 : 1}
                  draggable={designMode === "OBJECT"}
                  onClick={(e) => handleSelect(e, z.id)}
                  onDragEnd={(e) => {
                    const next = zones.map((item) =>
                      item.id === z.id
                        ? {
                            ...item,
                            x: Math.round(e.target.x() / GRID_SIZE) * GRID_SIZE,
                            y: Math.round(e.target.y() / GRID_SIZE) * GRID_SIZE,
                          }
                        : item,
                    );
                    saveToHistory(next);
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const next = zones.map((item) =>
                      item.id === z.id
                        ? {
                            ...item,
                            x: Math.round(node.x() / GRID_SIZE) * GRID_SIZE,
                            y: Math.round(node.y() / GRID_SIZE) * GRID_SIZE,
                            width:
                              Math.round(
                                (node.width() * node.scaleX()) / GRID_SIZE,
                              ) * GRID_SIZE,
                            height:
                              Math.round(
                                (node.height() * node.scaleY()) / GRID_SIZE,
                              ) * GRID_SIZE,
                          }
                        : item,
                    );
                    node.scaleX(1);
                    node.scaleY(1);
                    saveToHistory(next);
                  }}
                />
                <Group x={z.x} y={z.y}>
                  {z.shelves.map((s) => (
                    <Rect
                      key={s.id}
                      id={s.id}
                      {...s} // Lấy x, y, width, height từ state
                      fill={COLOR_SHELF}
                      stroke={
                        selectedIds.includes(s.id)
                          ? COLOR_SELECTION
                          : "transparent"
                      }
                      strokeWidth={2}
                      draggable={designMode === "OBJECT"} // Quan trọng: Phải là true để drag
                      onClick={(e) => handleSelect(e, s.id)}
                      onDragEnd={(e) => {
                        const next = zones.map((zone) =>
                          zone.id === z.id
                            ? {
                                ...zone,
                                shelves: zone.shelves.map((sh) =>
                                  sh.id === s.id
                                    ? {
                                        ...sh,
                                        x:
                                          Math.round(e.target.x() / GRID_SIZE) *
                                          GRID_SIZE,
                                        y:
                                          Math.round(e.target.y() / GRID_SIZE) *
                                          GRID_SIZE,
                                      }
                                    : sh,
                                ),
                              }
                            : zone,
                        );
                        saveToHistory(next);
                      }}
                      onTransformEnd={(e) => {
                        const node = e.target;
                        const newWidth =
                          Math.round(
                            (node.width() * node.scaleX()) / GRID_SIZE,
                          ) * GRID_SIZE;
                        const newHeight =
                          Math.round(
                            (node.height() * node.scaleY()) / GRID_SIZE,
                          ) * GRID_SIZE;

                        const next = zones.map((zone) =>
                          zone.id === z.id
                            ? {
                                ...zone,
                                shelves: zone.shelves.map((sh) =>
                                  sh.id === s.id
                                    ? {
                                        ...sh,
                                        width: newWidth,
                                        height: newHeight,
                                        x:
                                          Math.round(node.x() / GRID_SIZE) *
                                          GRID_SIZE,
                                        y:
                                          Math.round(node.y() / GRID_SIZE) *
                                          GRID_SIZE,
                                      }
                                    : sh,
                                ),
                              }
                            : zone,
                        );
                        // Reset scale về 1 để width/height mới thực thi đúng
                        node.scaleX(1);
                        node.scaleY(1);
                        saveToHistory(next);
                      }}
                    />
                  ))}
                </Group>
              </Group>
            ))}

            {/* NAVIGATION LAYER */}
            <Group opacity={designMode === "NAV" ? 1 : 0.4}>
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
              {navNodes.map((n) => (
                <Group
                  key={n.id}
                  id={n.id}
                  x={n.x}
                  y={n.y}
                  draggable={designMode === "NAV"}
                  onClick={(e) => handleSelect(e, n.id)}
                  // Thêm hàm ràng buộc vị trí khi kéo
                  dragBoundFunc={(pos) => {
                    // Chuyển đổi tọa độ màn hình sang tọa độ local của Stage
                    const stage = stageRef.current;
                    const scale = stage.scaleX();
                    const stageX = stage.x();
                    const stageY = stage.y();

                    // Giới hạn trong phạm vi whSize
                    const x = Math.max(
                      0,
                      Math.min((pos.x - stageX) / scale, whSize.width),
                    );
                    const y = Math.max(
                      0,
                      Math.min((pos.y - stageY) / scale, whSize.height),
                    );

                    return {
                      x: x * scale + stageX,
                      y: y * scale + stageY,
                    };
                  }}
                  onDragEnd={(e) => {
                    const newNodePos = {
                      x: Math.round(e.target.x() / GRID_SIZE) * GRID_SIZE,
                      y: Math.round(e.target.y() / GRID_SIZE) * GRID_SIZE,
                    };

                    setNavNodes((prev) =>
                      prev.map((node) =>
                        node.id === n.id ? { ...node, ...newNodePos } : node,
                      ),
                    );
                  }}
                >
                  <Circle
                    radius={6}
                    fill={activeNodeId === n.id ? "#e67e22" : COLOR_NAV_NODE}
                    stroke={
                      selectedIds.includes(n.id) ? COLOR_SELECTION : "#fff"
                    }
                    strokeWidth={2}
                  />
                </Group>
              ))}
            </Group>

            <Transformer
              ref={trRef}
              rotateEnabled={false}
              flipEnabled={false}
              borderStroke={COLOR_SELECTION}
              anchorStroke={COLOR_SELECTION}
              anchorFill="#fff"
            />
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
          </Layer>
        </Stage>
      </div>

      {/* RIGHT SIDEBAR  */}
      {/* Sidebar Phải: Chỉ hiện khi chọn Shelf */}
      {selectedEntity && (
        <div style={sidebarRightStyle}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px", color: "#2c3e50" }}>
              Cấu hình Kệ
            </h3>
            <button
              onClick={() => setSelectedEntity(null)}
              style={closeBtnStyle}
            >
              ✕
            </button>
          </div>

          {/* Phần 1: Kích thước */}
          <div style={panelStyle}>
            <p style={labelTitle}>Kích thước (mét)</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <small style={smallLabelStyle}>Rộng</small>
                <input
                  type="number"
                  style={inputStyle}
                  value={selectedEntity.width}
                  onChange={(e) => updateShelfSize("width", e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <small style={smallLabelStyle}>Dài</small>
                <input
                  type="number"
                  style={inputStyle}
                  value={selectedEntity.height}
                  onChange={(e) => updateShelfSize("height", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Phần 2: Cấu trúc Level & Bin */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "10px",
            }}
          >
            <p style={labelTitle}>Danh sách Tầng</p>
            <button onClick={addLevel} style={addBtnStyle}>
              +
            </button>
          </div>

          <div style={scrollAreaStyle}>
            {selectedEntity.levels && selectedEntity.levels.length > 0 ? (
              selectedEntity.levels.map((lv) => (
                <details key={lv.id} style={levelBoxStyle}>
                  <summary style={levelSummaryStyle}>
                    <span>{lv.name}</span>
                    <small style={{ color: "#7f8c8d", fontWeight: "normal" }}>
                      {" "}
                      ({lv.bins.length} ô)
                    </small>
                  </summary>

                  <div style={{ padding: "10px", backgroundColor: "#fff" }}>
                    <button
                      onClick={() => addBinToLevel(lv.id)}
                      style={addBinBtnStyle}
                    >
                      + Thêm Bin
                    </button>

                    <div style={binGridStyle}>
                      {lv.bins.map((bin) => (
                        <div key={bin.id} style={binBadgeStyle}>
                          <span style={{ flex: 1, fontSize: "10px" }}>
                            {bin.code}
                          </span>
                          <button
                            onClick={() => deleteBin(lv.id, bin.id)}
                            style={deleteBinIconStyle}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => deleteLevel(lv.id)}
                      style={deleteLevelLinkStyle}
                    >
                      Xóa tầng này
                    </button>
                  </div>
                </details>
              ))
            ) : (
              <div style={emptyStateStyle}>Chưa có tầng nào.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- CSS ---
const containerStyle = {
  display: "flex",
  width: "100vw",
  height: "100vh",
  overflow: "hidden",
};
const sidebarStyle = {
  width: "260px",
  backgroundColor: "#fff",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  borderRight: "2px solid #ddd",
  zIndex: 10,
};
const panelStyle = {
  padding: "12px",
  backgroundColor: "#f8f9fa",
  borderRadius: "8px",
  marginBottom: "15px",
};
const labelTitle = {
  fontSize: "12px",
  fontWeight: "bold",
  marginBottom: "8px",
};
const inputStyle = {
  width: "100%",
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  marginBottom: "5px",
};
const btnStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "8px",
  border: "none",
  borderRadius: "6px",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  backgroundColor: "#2f3640",
};
const modeBtn = {
  flex: 1,
  padding: "8px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: "bold",
  color: "#333", // Đã chỉnh màu text mặc định để dễ nhìn hơn
};
const helpBox = {
  marginTop: "auto",
  padding: "10px",
  background: "#f1f2f6",
  borderRadius: "6px",
  border: "1px solid #ccc",
};
const sidebarRightStyle = {
  width: "300px",
  backgroundColor: "#fff",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  borderLeft: "2px solid #ddd",
  height: "100vh",
  boxShadow: "-2px 0 10px rgba(0,0,0,0.05)",
  zIndex: 10,
};
const addBtnStyle = {
  width: "24px",
  height: "24px",
  backgroundColor: "#27ae60",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
const levelBoxStyle = {
  backgroundColor: "#f8f9fa",
  border: "1px solid #e1e4e8",
  borderRadius: "6px",
  marginBottom: "10px",
  overflow: "hidden",
};
const levelSummaryStyle = {
  padding: "10px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "bold",
  outline: "none",
};
const addBinBtnStyle = {
  width: "100%",
  padding: "5px",
  fontSize: "11px",
  backgroundColor: "#3498db",
  color: "#fff",
  border: "none",
  borderRadius: "3px",
  cursor: "pointer",
};
const binBadgeStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "4px 8px",
  backgroundColor: "#fff",
  border: "1px solid #d1d8e0",
  borderRadius: "4px",
  fontSize: "11px",
  color: "#2f3542",
  gap: "5px",
};
const scrollAreaStyle = {
  overflowY: "auto",
  flex: 1,
  marginTop: "10px",
  paddingRight: "5px",
};
const binGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "6px",
  marginTop: "10px",
};
const deleteBinIconStyle = {
  border: "none",
  background: "none",
  color: "#e74c3c",
  cursor: "pointer",
  fontSize: "10px",
  fontWeight: "bold",
};
const deleteLevelLinkStyle = {
  color: "#e74c3c",
  border: "none",
  background: "none",
  fontSize: "10px",
  marginTop: "12px",
  cursor: "pointer",
  display: "block",
};
const smallLabelStyle = {
  fontSize: "10px",
  color: "#7f8c8d",
  display: "block",
  marginBottom: "2px",
};
const closeBtnStyle = {
  border: "none",
  background: "none",
  cursor: "pointer",
  fontSize: "18px",
  color: "#95a5a6",
};
const emptyStateStyle = {
  textAlign: "center",
  color: "#bdc3c7",
  fontSize: "12px",
  marginTop: "20px",
};

export default WarehouseConfiguration;
