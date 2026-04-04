import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Stage,
  Layer,
  Rect,
  Group,
  Transformer,
  Circle,
  Line,
} from "react-konva";
import {
  Box,
  Navigation,
  Plus,
  Link as LinkIcon,
  Download,
  X,
  Layers,
  Trash2,
  CheckCircle2,
  Warehouse,
  Save,
} from "lucide-react";
import {
  Button,
  Tooltip,
  message,
  ConfigProvider,
  Divider,
  Tag,
  Typography,
} from "antd";
import api from "../../api/axios";

const { Paragraph } = Typography;

const WarehouseConfiguration = () => {
  const stageRef = useRef(null);
  const trRef = useRef(null);

  // Lấy params cho API Save và Fetch
  const params = useParams();
  const warehouseId = params.id || params.warehouseId;

  const [selectedIds, setSelectedIds] = useState([]);
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [clipboard, setClipboard] = useState(null);

  // --- Quản lý chế độ thiết kế ---
  const [designMode, setDesignMode] = useState("OBJECT");

  // --- State cho Selection Box ---
  const [selectionBox, setSelectionBox] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Khôi phục kích thước Stage gốc
  const [data, setData] = useState({
    width: 1200,
    height: 800,
    zones: [],
    nodes: [],
    edges: [],
  });

  // --- FEATURE: LOAD CẤU TRÚC KHO (MỚI) ---
  useEffect(() => {
    const fetchWarehouseStructure = async () => {
      const companyId = localStorage.getItem("companyId");
      if (!companyId || !warehouseId) return;

      try {
        const response = await api.get(
          `/get-warehouse-structure/${companyId}/${warehouseId}`,
        );

        if (response.data) {
          const fetchedData = response.data;
          console.log("warehouse structure: ", fetchedData);

          // Map Zones và Shelves an toàn, xử lý các trường hợp null từ Backend
          const mappedZones = (fetchedData.zones || []).map((z, zIndex) => ({
            id: z.id || `z-${Date.now()}-${zIndex}`,
            name: z.code || `Zone ${zIndex + 1}`,
            x: z.x ?? 100, // Nếu x = null, fallback về 100 để tránh crash UI
            y: z.y ?? 100,
            width: z.width || 300,
            height: z.height || 300,
            color: "rgba(57, 198, 198, 0.15)",
            // --- ADDED: FEATURE ZONE PROPERTIES (Load từ DB) ---
            isESD: z.isESD || false,
            isMSD: z.isMSD || false,
            zoneType: z.zoneType || "NORMAL",
            isEsd: z.isEsd ?? z.isESD ?? false,
            isMsd: z.isMsd ?? z.isMSD ?? false,
            // ===== ADDED CODE START =====
            // Load the new boolean fields
            isCold: z.isCold ?? false,
            isVulnerable: z.isVulnerable ?? false,
            isHighValue: z.isHighValue ?? false,
            // ===== ADDED CODE END =====
            shelves: (z.shelves || []).map((s, sIndex) => ({
              id: s.id || `s-${Date.now()}-${sIndex}`,
              code: s.code || `S-${sIndex + 1}`,
              x: s.x ?? 20,
              y: s.y ?? 20,
              width: s.width || 40,
              // ===== FIX START =====
              // FIX CONCEPTUAL MISMATCH: Map API length -> state height (2D canvas rendering depth)
              // Map API height -> state verticalHeight (Real world vertical height, unrendered)
              // Removed duplicate length/height properties to resolve Vite warnings
              height: s.length || 100,
              verticalHeight: s.height || 0,
              // ===== FIX END =====
              accessNodes: (s.accessNodes || []).map((a) => ({
                id: a.id,
                side: a.side || "none",
                x: a.x ?? 0,
                y: a.y ?? 0,
                radius: a.radius || 6,
              })),
              levels: (s.levels || []).map((l) => ({
                id: l.id,
                name: l.code || "",
                bins: (l.bins || []).map((b) => ({
                  id: b.id,
                  name: b.code || "",
                  // Ép kiểu an toàn: Dù DB trả về boolean (false) hay chuỗi ("inactive"), đều đưa về chuẩn "inactive".
                  status:
                    b.status === false ||
                    b.status === "false" ||
                    b.status === "inactive" ||
                    b.status === "INACTIVE"
                      ? "inactive"
                      : "active",
                })),
              })),
            })),
          }));

          // Lọc mảng nodes từ backend (Chỉ giữ lại nav nodes, loại bỏ các acc- nodes bị duplicate vào mảng chung)
          const mappedNodes = (fetchedData.nodes || [])
            .filter((n) => n.id && n.id.startsWith("n-"))
            .map((n) => ({
              id: n.id,
              x: n.x ?? 100,
              y: n.y ?? 100,
              radius: n.radius || 8,
              color:
                n.type === "start"
                  ? "#10b981"
                  : n.type === "finish"
                    ? "#ef4444"
                    : "#39c6c6",
              side: n.side || "none",
              type: n.type || "nav",
            }));

          const mappedEdges = (fetchedData.edges || []).map((e) => ({
            id: e.id,
            from: e.from,
            to: e.to,
            distance: e.distance || 0,
          }));

          // Cập nhật State để render lên Stage
          setData({
            width: fetchedData.width || 2000,
            height: fetchedData.height || 1500,
            zones: mappedZones,
            nodes: mappedNodes,
            edges: mappedEdges,
          });
        }
      } catch (error) {
        console.error("Fetch structure error:", error);
        // Bỏ qua lỗi 404 vì đó có thể là kho mới chưa có cấu trúc nào được lưu
        if (error.response && error.response.status !== 404) {
          message.error("Failed to load existing warehouse structure.");
        }
      }
    };

    fetchWarehouseStructure();
  }, [warehouseId]);

  // --- FEATURE: LƯU CẤU TRÚC KHO ---
  const handleSaveStructure = async () => {
    const companyId = localStorage.getItem("companyId");

    if (!companyId) {
      message.error("Company ID not found. Please log in again.");
      return;
    }
    if (!warehouseId) {
      message.error("Warehouse ID is missing from the route.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        width: data.width,
        height: data.height,
        zones: data.zones.map((z) => ({
          id: z.id,
          code: z.name || "",
          x: z.x,
          y: z.y,
          width: z.width,
          height: z.height,
          // --- ADDED: FEATURE ZONE PROPERTIES (Lưu xuống DB) ---
          isESD: z.isESD || false,
          isMSD: z.isMSD || false,
          zoneType: z.zoneType || "NORMAL",
          isEsd: z.isEsd ?? z.isESD ?? false,
          isMsd: z.isMsd ?? z.isMSD ?? false,
          // ===== ADDED CODE START =====
          // Include the new fields in the payload
          isCold: z.isCold ?? false,
          isVulnerable: z.isVulnerable ?? false,
          isHighValue: z.isHighValue ?? false,
          // ===== ADDED CODE END =====
          shelves: z.shelves.map((s) => ({
            id: s.id,
            code: s.code || "",
            x: s.x,
            y: s.y,
            width: s.width,
            // ===== FIX START =====
            // RE-MAP TO API STRUCTURE:
            // Send internal 2D state 'height' as API 'length'
            // Send internal vertical 'verticalHeight' as API 'height'
            // Cleaned duplicate properties.
            length: s.height,
            height: s.verticalHeight ?? 0,
            // ===== FIX END =====
            accessNodes: (s.accessNodes || []).map((a) => ({
              id: a.id,
              side: a.side || "none",
              x: a.x,
              y: a.y,
              radius: a.radius || 6,
            })),
            levels: (s.levels || []).map((l) => ({
              id: l.id,
              code: l.name || "",
              bins: (l.bins || []).map((b) => ({
                id: b.id,
                code: b.name || "",
                // Cố định luôn gửi lên chuỗi "active" hoặc "inactive"
                status:
                  b.status === false || b.status === "inactive"
                    ? "inactive"
                    : "active",
                // ===== ADDED CODE START =====
                width: s.width || 0,
                length: (s.height || 0) / (l.bins?.length || 1),
                height: (s.verticalHeight || 0) / (s.levels?.length || 1),
                // ===== ADDED CODE END =====
              })),
            })),
          })),
        })),
        nodes: data.nodes.map((n) => ({
          id: n.id,
          x: n.x,
          y: n.y,
          radius: n.radius || 8,
          side: n.side || "none",
          type: n.type || "nav",
        })),
        edges: data.edges.map((e) => ({
          id: e.id,
          from: e.from,
          to: e.to,
          distance: e.distance || 0,
        })),
      };

      console.log("payload: ", payload);

      await api.post(
        `/update-company-warehouse/${companyId}/structure/${warehouseId}`,
        payload,
      );

      message.success("Warehouse structure saved successfully!");
    } catch (error) {
      console.error("Save structure error:", error);
      message.error(
        error.response?.data?.message || "Failed to save warehouse structure",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // --- LOGIC FUNCTIONS ---
  // ===== ADDED CODE START =====
  const handleUpdateShelfDimension = (zoneId, shelfId, field, value) => {
    // Avoid NaN crashing Konva, fallback to 0 safely
    const numValue = Math.max(0, Number(value) || 0);
    setData((prev) => ({
      ...prev,
      zones: prev.zones.map((z) => {
        if (z.id !== zoneId) return z;
        return {
          ...z,
          shelves: z.shelves.map((s) => {
            if (s.id !== shelfId) return s;
            return { ...s, [field]: numValue };
          }),
        };
      }),
    }));
  };
  // ===== ADDED CODE END =====

  const getNextShelfCode = (currentData) => {
    let maxNum = 0;
    currentData.zones.forEach((z) => {
      z.shelves.forEach((s) => {
        const match = s.code?.match(/S-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });
    });
    return `S-${maxNum + 1}`;
  };

  const findNodeCoords = (id) => {
    const navNode = data.nodes.find((n) => n.id === id);
    if (navNode) return { x: navNode.x, y: navNode.y };

    for (const zone of data.zones) {
      for (const shelf of zone.shelves) {
        const accNode = shelf.accessNodes?.find((a) => a.id === id);
        if (accNode) {
          return { x: zone.x + accNode.x, y: zone.y + accNode.y };
        }
      }
    }
    return null;
  };

  const getSelectedShelf = () => {
    if (selectedIds.length !== 1) return null;
    const sid = selectedIds[0];
    if (!sid.startsWith("s-")) return null;

    for (const zone of data.zones) {
      const shelf = zone.shelves.find((s) => s.id === sid);
      if (shelf) return { zoneId: zone.id, ...shelf };
    }
    return null;
  };

  const activeShelf = getSelectedShelf();

  // --- ADDED: FEATURE - LẤY ZONE ĐANG ĐƯỢC CHỌN ---
  const getSelectedZone = () => {
    if (selectedIds.length !== 1) return null;
    const zid = selectedIds[0];
    if (!zid.startsWith("z-")) return null;
    return data.zones.find((z) => z.id === zid) || null;
  };

  const activeZone = getSelectedZone();

  // FEATURE - LẤY NODE ĐANG ĐƯỢC CHỌN
  const getSelectedNode = () => {
    if (selectedIds.length !== 1) return null;
    const nid = selectedIds[0];
    if (!nid.startsWith("n-")) return null;
    return data.nodes.find((n) => n.id === nid) || null;
  };

  const activeNode = getSelectedNode();

  // Hàm cập nhật thuộc tính cho Node
  const handleUpdateNode = (nodeId, field, value) => {
    setData((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => {
        if (n.id === nodeId) {
          let newColor = n.color;
          // Cập nhật màu sắc UI dựa trên loại Type
          if (field === "type") {
            if (value === "start")
              newColor = "#10b981"; // Green
            else if (value === "finish")
              newColor = "#ef4444"; // Red
            else newColor = "#39c6c6"; // Cyan
          }
          return { ...n, [field]: value, color: newColor };
        }
        return n;
      }),
    }));
  };

  // Hàm cập nhật trạng thái của Zone
  const handleUpdateZone = (zoneId, field, value) => {
    setData((prev) => ({
      ...prev,
      zones: prev.zones.map((z) =>
        z.id === zoneId ? { ...z, [field]: value } : z,
      ),
    }));
  };
  // -------------------------------------------------

  const handleToggleAccessNode = (zoneId, shelfId, side) => {
    setData((prev) => ({
      ...prev,
      zones: prev.zones.map((z) => {
        if (z.id !== zoneId) return z;
        return {
          ...z,
          shelves: z.shelves.map((s) => {
            if (s.id !== shelfId) return s;

            const accessNodes = s.accessNodes || [];
            const exists = accessNodes.find((n) => n.side === side);

            if (exists) {
              return {
                ...s,
                accessNodes: accessNodes.filter((n) => n.side !== side),
              };
            } else {
              let newPos = { x: 0, y: 0 };
              const offset = 10;

              switch (side) {
                case "top":
                  newPos = { x: s.x + s.width / 2, y: s.y - offset };
                  break;
                case "bottom":
                  newPos = { x: s.x + s.width / 2, y: s.y + s.height + offset };
                  break;
                case "left":
                  newPos = { x: s.x - offset, y: s.y + s.height / 2 };
                  break;
                case "right":
                  newPos = { x: s.x + s.width + offset, y: s.y + s.height / 2 };
                  break;
                default:
                  break;
              }

              const newNode = {
                id: `acc-${side}-${Date.now()}`,
                side: side,
                ...newPos,
              };
              return { ...s, accessNodes: [...accessNodes, newNode] };
            }
          }),
        };
      }),
    }));
  };

  const handleAddAccessNode = (zoneId, shelfId) => {
    setData((prev) => ({
      ...prev,
      zones: prev.zones.map((z) => {
        if (z.id !== zoneId) return z;
        return {
          ...z,
          shelves: prev.zones
            .find((zone) => zone.id === zoneId)
            .shelves.map((s) => {
              if (s.id !== shelfId) return s;
              const accessNodes = s.accessNodes || [];
              const newNode = {
                id: `acc-${Date.now()}`,
                x: s.x + s.width / 2,
                y: s.y + s.height + 10,
              };
              return { ...s, accessNodes: [...accessNodes, newNode] };
            }),
        };
      }),
    }));
  };

  const handleExportConsole = () => {
    console.log("=== WAREHOUSE CONFIGURATION DATA ===");
    console.log(JSON.stringify(data, null, 2));
    console.log("=====================================");
    message.success("Dữ liệu đã được in ra Console (Nhấn F12 để xem)");
  };

  const performConnect = (from, to) => {
    if (from === to) return;
    const exists = data.edges.find(
      (e) =>
        (e.from === from && e.to === to) || (e.from === to && e.to === from),
    );

    if (!exists) {
      const eid = `e-${Date.now()}`;
      setData((prev) => ({
        ...prev,
        edges: [...prev.edges, { id: eid, from, to }],
      }));
    }
  };

  const handleAddZone = () => {
    const nid = `z-${Date.now()}`;
    const newZone = {
      id: nid,
      name: `Zone ${data.zones.length + 1}`,
      x: (window.innerWidth / 2 - 300 / 2 - stagePos.x) / scale - 125,
      y: (window.innerHeight / 2 - stagePos.y) / scale - 125,
      width: 250,
      height: 250,
      color: "rgba(57, 198, 198, 0.15)",
      shelves: [],
      // --- ADDED: Giá trị mặc định khi tạo mới ---
      isESD: false,
      isMSD: false,
      zoneType: "NORMAL",
      isEsd: false,
      isMsd: false,
      // ===== ADDED CODE START =====
      // Initialize new fields as false for new zones
      isCold: false,
      isVulnerable: false,
      isHighValue: false,
      // ===== ADDED CODE END =====
    };
    setData((prev) => ({ ...prev, zones: [...prev.zones, newZone] }));
    setSelectedIds([nid]);
    setDesignMode("OBJECT");
  };

  const handleAddShelf = () => {
    setData((prev) => {
      const targetZone = prev.zones.find(
        (z) =>
          selectedIds.includes(z.id) ||
          z.shelves.some((s) => selectedIds.includes(s.id)),
      );
      if (!targetZone) {
        message.warning("Vui lòng chọn Zone trước!");
        return prev;
      }

      const nid = `s-${Date.now()}`;
      const newShelf = {
        id: nid,
        code: getNextShelfCode(prev),
        x: 20,
        y: 20,
        width: 40,
        // ===== FIX START =====
        // FIX OVERRIDE: Keep 2D depth mapped to state height, vertical height mapped to state verticalHeight
        // Cleaned up duplicate keys
        height: 100,
        verticalHeight: 0,
        // ===== FIX END =====
        accessNodes: [],
        levels: [],
      };
      const newData = {
        ...prev,
        zones: prev.zones.map((z) =>
          z.id === targetZone.id
            ? { ...z, shelves: [...z.shelves, newShelf] }
            : z,
        ),
      };
      setTimeout(() => setSelectedIds([nid]), 0);
      return newData;
    });
    setDesignMode("OBJECT");
  };

  const handleAddNode = (posX, posY) => {
    const nid = `n-${Date.now()}`;
    const newNode = {
      id: nid,
      x: posX || 100,
      y: posY || 100,
      radius: 8,
      color: "#39c6c6",
      type: "nav", // Default type required by API
    };
    setData((prev) => ({ ...prev, nodes: [...prev.nodes, newNode] }));
    setSelectedIds([nid]);
    setDesignMode("NAV");
  };

  const handleAddEdge = () => {
    const validNodeIds = selectedIds.filter(
      (id) => id.startsWith("n-") || id.startsWith("acc-"),
    );
    if (validNodeIds.length !== 2) {
      message.warning("Hãy chọn đúng 2 Node để nối!");
      return;
    }
    performConnect(validNodeIds[0], validNodeIds[1]);
  };

  useEffect(() => {
    if (trRef.current) {
      const nodes = selectedIds
        .map((id) => stageRef.current.findOne("." + id))
        .filter((node) => node !== undefined);
      trRef.current.nodes(nodes);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedIds, data]);

  const handleTransformOrDragEnd = () => {
    const stage = stageRef.current;
    let updatedZones = [...data.zones];
    let updatedNavNodes = [...data.nodes];

    selectedIds.forEach((id) => {
      const node = stage.findOne("." + id);
      if (!node) return;

      const newAttrs = {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * node.scaleX()),
        height: Math.max(5, node.height() * node.scaleY()),
      };

      node.setAttrs({
        scaleX: 1,
        scaleY: 1,
        width: newAttrs.width,
        height: newAttrs.height,
      });

      if (id.startsWith("z-")) {
        updatedZones = updatedZones.map((z) =>
          z.id === id ? { ...z, ...newAttrs } : z,
        );
      } else if (id.startsWith("s-")) {
        updatedZones = updatedZones.map((z) => ({
          ...z,
          shelves: z.shelves.map((s) => {
            if (s.id === id) {
              const diffX = newAttrs.x - s.x;
              const diffY = newAttrs.y - s.y;

              return {
                ...s,
                ...newAttrs,
                accessNodes: s.accessNodes?.map((acc) => ({
                  ...acc,
                  x: acc.x + diffX,
                  y: acc.y + diffY,
                })),
              };
            }
            return s;
          }),
        }));
      } else if (id.startsWith("n-")) {
        updatedNavNodes = updatedNavNodes.map((n) =>
          n.id === id ? { ...n, x: node.x(), y: node.y() } : n,
        );
      } else if (id.startsWith("acc-")) {
        updatedZones = updatedZones.map((z) => ({
          ...z,
          shelves: z.shelves.map((s) => ({
            ...s,
            accessNodes: s.accessNodes?.map((acc) =>
              acc.id === id
                ? { ...acc, x: node.x() - z.x, y: node.y() - z.y }
                : acc,
            ),
          })),
        }));
      }
    });

    setData((prev) => ({
      ...prev,
      zones: updatedZones,
      nodes: updatedNavNodes,
    }));
  };

  const handleSelect = (e, id) => {
    e.cancelBubble = true;
    if (!e.evt.shiftKey) setSelectedIds([id]);
    else
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newScale = e.evt.deltaY < 0 ? oldScale * 1.1 : oldScale / 1.1;
    setScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleCopy = () => {
    if (selectedIds.length === 0) return;
    let minX = Infinity,
      minY = Infinity;
    selectedIds.forEach((id) => {
      const node = stageRef.current.findOne("." + id);
      if (node) {
        const abs = node.getAbsolutePosition();
        minX = Math.min(minX, abs.x);
        minY = Math.min(minY, abs.y);
      }
    });
    const items = [];
    data.zones.forEach((z) => {
      if (selectedIds.includes(z.id))
        items.push({
          type: "ZONE",
          data: JSON.parse(JSON.stringify(z)),
          offsetX: z.x - (minX - stagePos.x) / scale,
          offsetY: z.y - (minY - stagePos.y) / scale,
        });
      z.shelves.forEach((s) => {
        if (selectedIds.includes(s.id)) {
          const node = stageRef.current.findOne("." + s.id);
          const abs = node.getAbsolutePosition();
          items.push({
            type: "SHELF",
            data: JSON.parse(JSON.stringify(s)),
            parentZoneId: z.id,
            distX: (abs.x - minX) / scale,
            distY: (abs.y - minY) / scale,
          });
        }
      });
    });
    setClipboard(items);
  };

  const handlePaste = () => {
    if (!clipboard) return;
    const newIds = [];
    setData((prev) => {
      let updatedZones = [...prev.zones];
      let currentMaxCode = parseInt(getNextShelfCode(prev).split("-")[1]);

      const activeZoneId = prev.zones.find(
        (z) =>
          selectedIds.includes(z.id) ||
          z.shelves.some((s) => selectedIds.includes(s.id)),
      )?.id;

      clipboard.forEach((item, index) => {
        const prefix = item.type === "SHELF" ? "s" : "z";
        const nid = `${prefix}-${Date.now()}-${index}`;
        newIds.push(nid);

        if (item.type === "ZONE") {
          updatedZones.push({
            ...item.data,
            id: nid,
            x: item.data.x + 50,
            y: item.data.y + 50,
            shelves: item.data.shelves.map((s) => ({
              ...s,
              id: `s-${Math.random()}`,
              accessNodes: s.accessNodes?.map((acc) => ({
                ...acc,
                id: `acc-${Math.random()}`,
              })),
              levels: s.levels?.map((l) => ({
                ...l,
                id: `lvl-${Math.random()}`,
                bins: l.bins?.map((b) => ({
                  ...b,
                  id: `bin-${Math.random()}`,
                })),
              })),
            })),
          });
        } else {
          const targetId = activeZoneId || item.parentZoneId;
          const newCode = `S-${currentMaxCode}`;
          currentMaxCode++;

          const newShelfX = item.distX + 50;
          const newShelfY = item.distY + 50;

          const diffX = newShelfX - item.data.x;
          const diffY = newShelfY - item.data.y;

          updatedZones = updatedZones.map((z) =>
            z.id === targetId
              ? {
                  ...z,
                  shelves: [
                    ...z.shelves,
                    {
                      ...item.data,
                      id: nid,
                      code: newCode,
                      x: newShelfX,
                      y: newShelfY,
                      accessNodes: item.data.accessNodes?.map((acc) => ({
                        ...acc,
                        id: `acc-${Date.now()}-${Math.random()}`,
                        x: acc.x + diffX,
                        y: acc.y + diffY,
                      })),
                      levels: item.data.levels?.map((l) => ({
                        ...l,
                        id: `lvl-${Math.random()}`,
                        bins: l.bins?.map((b) => ({
                          ...b,
                          id: `bin-${Math.random()}`,
                        })),
                      })),
                    },
                  ],
                }
              : z,
          );
        }
      });
      setTimeout(() => setSelectedIds(newIds), 0);
      return { ...prev, zones: updatedZones };
    });
  };

  const handleStageMouseDown = (e) => {
    if (e.target === e.target.getStage()) {
      if (e.evt.ctrlKey) {
        const pos = stageRef.current.getRelativePointerPosition();
        setSelectionBox({ x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y });
      } else setSelectedIds([]);
    }
  };

  const handleStageMouseMove = (e) => {
    if (!selectionBox) return;
    const pos = stageRef.current.getRelativePointerPosition();
    setSelectionBox((prev) => ({ ...prev, x2: pos.x, y2: pos.y }));
  };

  const handleStageMouseUp = () => {
    if (!selectionBox) return;
    const x = Math.min(selectionBox.x1, selectionBox.x2);
    const y = Math.min(selectionBox.y1, selectionBox.y2);
    const w = Math.abs(selectionBox.x2 - selectionBox.x1);
    const h = Math.abs(selectionBox.y2 - selectionBox.y1);
    const foundIds = [];
    data.zones.forEach((z) => {
      if (
        z.x >= x &&
        z.x + z.width <= x + w &&
        z.y >= y &&
        z.y + z.height <= y + h
      )
        foundIds.push(z.id);
      z.shelves.forEach((s) => {
        const absX = z.x + s.x;
        const absY = z.y + s.y;
        if (
          absX >= x &&
          absX + s.width <= x + w &&
          absY >= y &&
          absY + s.height <= y + h
        )
          foundIds.push(s.id);
        s.accessNodes?.forEach((acc) => {
          const aX = z.x + acc.x;
          const aY = z.y + acc.y;
          if (aX >= x && aX <= x + w && aY >= y && aY <= y + h)
            foundIds.push(acc.id);
        });
      });
    });
    data.nodes.forEach((n) => {
      if (n.x >= x && n.x <= x + w && n.y >= y && n.y <= y + h)
        foundIds.push(n.id);
    });
    if (foundIds.length > 0) setSelectedIds(foundIds);
    setSelectionBox(null);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (e.target.tagName === "INPUT") return;
      if ((e.ctrlKey || e.metaKey) && key === "c") handleCopy();
      if ((e.ctrlKey || e.metaKey) && key === "v") handlePaste();
      if (key === "d" && !e.ctrlKey) handleAddZone();
      if (key === "r") handleAddShelf();
      if (key === "n") {
        const pos = stageRef.current.getRelativePointerPosition();
        handleAddNode(pos.x, pos.y);
      }
      if (key === "e") handleAddEdge();
      if (e.key === "Delete" || e.key === "Backspace") {
        setData((p) => ({
          ...p,
          zones: p.zones
            .map((z) => ({
              ...z,
              shelves: z.shelves
                .filter((s) => !selectedIds.includes(s.id))
                .map((s) => ({
                  ...s,
                  accessNodes: s.accessNodes?.filter(
                    (a) => !selectedIds.includes(a.id),
                  ),
                })),
            }))
            .filter((z) => !selectedIds.includes(z.id)),
          nodes: p.nodes.filter((n) => !selectedIds.includes(n.id)),
          edges: p.edges.filter(
            (edge) =>
              !selectedIds.includes(edge.from) &&
              !selectedIds.includes(edge.to),
          ),
        }));
        setSelectedIds([]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds, clipboard, data, scale, stagePos]);

  const handleAddLevel = (zoneId, shelfId) => {
    setData((prev) => ({
      ...prev,
      zones: prev.zones.map((z) => {
        if (z.id !== zoneId) return z;
        return {
          ...z,
          shelves: z.shelves.map((s) => {
            if (s.id !== shelfId) return s;
            const levels = s.levels || [];
            const newLevel = {
              id: `lvl-${Date.now()}`,
              name: `L-${levels.length + 1}`,
              bins: [],
            };
            return { ...s, levels: [...levels, newLevel] };
          }),
        };
      }),
    }));
  };

  const handleDeleteLevel = (zoneId, shelfId, levelId) => {
    setData((prev) => ({
      ...prev,
      zones: prev.zones.map((z) => {
        if (z.id !== zoneId) return z;
        return {
          ...z,
          shelves: z.shelves.map((s) => {
            if (s.id !== shelfId) return s;
            return {
              ...s,
              levels: (s.levels || []).filter((l) => l.id !== levelId),
            };
          }),
        };
      }),
    }));
  };

  const handleAddBin = (zoneId, shelfId, levelId) => {
    setData((prev) => ({
      ...prev,
      zones: prev.zones.map((z) => {
        if (z.id !== zoneId) return z;
        return {
          ...z,
          shelves: z.shelves.map((s) => {
            if (s.id !== shelfId) return s;
            return {
              ...s,
              levels: (s.levels || []).map((l) => {
                if (l.id !== levelId) return l;
                const newBin = {
                  id: `bin-${Date.now()}-${Math.random()}`,
                  name: `B-${l.bins.length + 1}`,
                  status: "active", // Trạng thái mặc định khi tạo mới
                };
                return { ...l, bins: [...l.bins, newBin] };
              }),
            };
          }),
        };
      }),
    }));
  };

  const handleDeleteBin = (zoneId, shelfId, levelId, binId) => {
    setData((prev) => ({
      ...prev,
      zones: prev.zones.map((z) => {
        if (z.id !== zoneId) return z;
        return {
          ...z,
          shelves: z.shelves.map((s) => {
            if (s.id !== shelfId) return s;
            return {
              ...s,
              levels: (s.levels || []).map((l) => {
                if (l.id !== levelId) return l;
                return { ...l, bins: l.bins.filter((b) => b.id !== binId) };
              }),
            };
          }),
        };
      }),
    }));
  };

  // Hàm cập nhật trạng thái của Bin
  const handleUpdateBinStatus = (
    zoneId,
    shelfId,
    levelId,
    binId,
    newStatus,
  ) => {
    setData((prev) => ({
      ...prev,
      zones: prev.zones.map((z) => {
        if (z.id !== zoneId) return z;
        return {
          ...z,
          shelves: z.shelves.map((s) => {
            if (s.id !== shelfId) return s;
            return {
              ...s,
              levels: (s.levels || []).map((l) => {
                if (l.id !== levelId) return l;
                return {
                  ...l,
                  bins: l.bins.map((b) => {
                    if (b.id !== binId) return b;
                    return { ...b, status: newStatus };
                  }),
                };
              }),
            };
          }),
        };
      }),
    }));
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#39c6c6" } }}>
      <div className="!flex !w-screen !h-screen !bg-slate-900 !overflow-hidden !font-sans">
        {/* SIDEBAR TRÁI - TOOLBOX */}
        <aside className="!w-[300px] !bg-slate-800 !border-r !border-slate-700 !flex !flex-col !z-10 !shadow-2xl">
          <div className="!p-6">
            <h1 className="!text-xl !font-black !text-white !tracking-tighter !flex !items-center !gap-2 !mb-8">
              <Warehouse className="!text-[#39c6c6]" size={24} />
              STORIX <span className="!text-[#39c6c6]">PRO</span>
            </h1>

            <div className="!flex !bg-slate-700/50 !p-1 !rounded-xl !mb-8">
              <button
                className={`!flex-1 !py-2 !rounded-lg !text-xs !font-bold !transition-all !flex !items-center !justify-center !gap-2 ${
                  designMode === "OBJECT"
                    ? "!bg-[#39c6c6] !text-slate-900"
                    : "!text-slate-400 hover:!text-white"
                }`}
                onClick={() => {
                  setDesignMode("OBJECT");
                  setSelectedIds([]);
                }}
              >
                <Box size={14} /> Vật thể
              </button>
              <button
                className={`!flex-1 !py-2 !rounded-lg !text-xs !font-bold !transition-all !flex !items-center !justify-center !gap-2 ${
                  designMode === "NAV"
                    ? "!bg-[#39c6c6] !text-slate-900"
                    : "!text-slate-400 hover:!text-white"
                }`}
                onClick={() => {
                  setDesignMode("NAV");
                  setSelectedIds([]);
                }}
              >
                <Navigation size={14} /> Điều hướng
              </button>
            </div>

            <div className="!space-y-3">
              {designMode === "OBJECT" ? (
                <>
                  <Button
                    block
                    size="large"
                    type="primary"
                    icon={<Plus size={18} />}
                    onClick={handleAddZone}
                    className="!h-12 !rounded-xl !font-bold !bg-[#39c6c6] !border-none"
                  >
                    Add Zone (D)
                  </Button>
                  <Button
                    block
                    size="large"
                    ghost
                    icon={<Plus size={18} />}
                    onClick={handleAddShelf}
                    className="!h-12 !rounded-xl !font-bold !border-[#39c6c6] !text-[#39c6c6] hover:!bg-[#39c6c6]/10"
                  >
                    Add Shelf (R)
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    block
                    size="large"
                    type="primary"
                    icon={<Plus size={18} />}
                    onClick={() => handleAddNode()}
                    className="!h-12 !rounded-xl !font-bold !bg-[#39c6c6] !border-none"
                  >
                    Add Node (N)
                  </Button>
                  <Button
                    block
                    size="large"
                    ghost
                    icon={<LinkIcon size={18} />}
                    onClick={handleAddEdge}
                    className="!h-12 !rounded-xl !font-bold !border-[#39c6c6] !text-[#39c6c6]"
                  >
                    Connect Node (E)
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="!mt-auto !p-6 !border-t !border-slate-700 !bg-slate-800/50 !space-y-3">
            <Button
              block
              type="primary"
              loading={isSaving}
              icon={<Save size={18} />}
              onClick={handleSaveStructure}
              className="!h-12 !rounded-xl !font-bold !bg-[#10b981] hover:!bg-[#059669] !border-none"
            >
              Save Structure
            </Button>
            <Button
              block
              icon={<Download size={18} />}
              onClick={handleExportConsole}
              className="!h-12 !rounded-xl !font-bold !text-slate-300 !border-slate-600 hover:!text-[#39c6c6] hover:!border-[#39c6c6]"
            >
              Export JSON (F12)
            </Button>
            <div className="!mt-4 !text-[10px] !text-slate-500 !flex !justify-between !uppercase !font-bold">
              <span>Shortcuts: Ctrl+C / Ctrl+V / Del</span>
            </div>
          </div>
        </aside>

        {/* CENTER - KONVA STAGE */}
        <main className="!flex-1 !relative !overflow-hidden">
          <Stage
            width={
              window.innerWidth -
              (activeShelf || activeZone || activeNode ? 600 : 300)
            }
            height={window.innerHeight}
            ref={stageRef}
            scaleX={scale}
            scaleY={scale}
            x={stagePos.x}
            y={stagePos.y}
            onWheel={handleWheel}
            draggable={!trRef.current?.nodes().length && !selectionBox}
            onMouseDown={handleStageMouseDown}
            onMouseMove={handleStageMouseMove}
            onMouseUp={handleStageMouseUp}
            className="!bg-slate-900"
          >
            <Layer>
              <Rect
                width={data.width}
                height={data.height}
                fill="#ffffff"
                shadowBlur={50}
                shadowColor="black"
                shadowOpacity={0.1}
              />
            </Layer>
            <Layer>
              {/* EDGES LAYER */}
              {data.edges.map((edge) => {
                const p1 = findNodeCoords(edge.from);
                const p2 = findNodeCoords(edge.to);
                return p1 && p2 ? (
                  <Line
                    key={edge.id}
                    points={[p1.x, p1.y, p2.x, p2.y]}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dash={[5, 5]}
                  />
                ) : null;
              })}

              {/* ZONES VÀ SHELVES */}
              <Group
                opacity={designMode === "OBJECT" ? 1 : 0.3}
                listening={designMode === "OBJECT"}
              >
                {data.zones.map((zone) => (
                  <Group key={zone.id}>
                    <Rect
                      name={zone.id}
                      className={zone.id}
                      x={zone.x}
                      y={zone.y}
                      width={zone.width}
                      height={zone.height}
                      fill={zone.color}
                      stroke={
                        selectedIds.includes(zone.id) ? "#3b82f6" : "#94a3b8"
                      }
                      strokeWidth={selectedIds.includes(zone.id) ? 2 : 1}
                      draggable={selectedIds.includes(zone.id)}
                      onDragEnd={handleTransformOrDragEnd}
                      onTransformEnd={handleTransformOrDragEnd}
                      onClick={(e) => handleSelect(e, zone.id)}
                    />
                    <Group x={zone.x} y={zone.y}>
                      {zone.shelves.map((shelf) => (
                        <Rect
                          key={shelf.id}
                          name={shelf.id}
                          className={shelf.id}
                          x={shelf.x}
                          y={shelf.y}
                          width={shelf.width}
                          height={shelf.height}
                          fill="#334155"
                          draggable={selectedIds.includes(shelf.id)}
                          stroke={
                            selectedIds.includes(shelf.id)
                              ? "#3b82f6"
                              : "transparent"
                          }
                          strokeWidth={2}
                          onClick={(e) => handleSelect(e, shelf.id)}
                          onDragEnd={handleTransformOrDragEnd}
                          onTransformEnd={handleTransformOrDragEnd}
                        />
                      ))}
                    </Group>
                  </Group>
                ))}
              </Group>

              {/* ACCESS NODES VÀ NAV NODES (Cho phép listening liên tục) */}
              <Group opacity={designMode === "NAV" ? 1 : 0.6}>
                {data.zones.map((zone) =>
                  zone.shelves.map((shelf) =>
                    shelf.accessNodes?.map((acc) => (
                      <Circle
                        key={acc.id}
                        name={acc.id}
                        className={acc.id}
                        x={zone.x + acc.x}
                        y={zone.y + acc.y}
                        radius={6}
                        fill="#10b981"
                        stroke={
                          selectedIds.includes(acc.id) ? "#3b82f6" : "#fff"
                        }
                        strokeWidth={2}
                        draggable={designMode === "OBJECT"}
                        onDragEnd={handleTransformOrDragEnd}
                        onClick={(e) => {
                          if (
                            designMode === "NAV" &&
                            e.evt.shiftKey &&
                            selectedIds.length === 1
                          ) {
                            const fromId = selectedIds[0];
                            if (
                              fromId.startsWith("n-") ||
                              fromId.startsWith("acc-")
                            ) {
                              performConnect(fromId, acc.id);
                            }
                          }
                          handleSelect(e, acc.id);
                        }}
                      />
                    )),
                  ),
                )}

                {data.nodes.map((node) => (
                  <Circle
                    key={node.id}
                    name={node.id}
                    className={node.id}
                    x={node.x}
                    y={node.y}
                    radius={node.radius}
                    fill={node.color}
                    stroke={selectedIds.includes(node.id) ? "#3b82f6" : "#fff"}
                    strokeWidth={2}
                    draggable={designMode === "NAV"}
                    onClick={(e) => {
                      if (
                        designMode === "NAV" &&
                        e.evt.shiftKey &&
                        selectedIds.length === 1
                      ) {
                        const fromId = selectedIds[0];
                        if (
                          fromId.startsWith("n-") ||
                          fromId.startsWith("acc-")
                        ) {
                          performConnect(fromId, node.id);
                        }
                      }
                      handleSelect(e, node.id);
                    }}
                    onDragEnd={handleTransformOrDragEnd}
                  />
                ))}
              </Group>

              <Transformer
                ref={trRef}
                rotateEnabled={false}
                borderStroke="#3b82f6"
                anchorStroke="#3b82f6"
                anchorFill="#fff"
              />
              {selectionBox && (
                <Rect
                  x={Math.min(selectionBox.x1, selectionBox.x2)}
                  y={Math.min(selectionBox.y1, selectionBox.y2)}
                  width={Math.abs(selectionBox.x2 - selectionBox.x1)}
                  height={Math.abs(selectionBox.y2 - selectionBox.y1)}
                  fill="rgba(59, 130, 246, 0.15)"
                  stroke="#3b82f6"
                  strokeWidth={1}
                  dash={[4, 4]}
                />
              )}
            </Layer>
          </Stage>
        </main>

        {/* SIDEBAR PHẢI - DETAILS */}
        {(activeShelf || activeZone || activeNode) && (
          <aside className="!w-[300px] !bg-slate-800 !border-l !border-[#10b981] !border-l-2 !flex !flex-col !overflow-y-auto !z-10 !shadow-[-5px_0_15px_rgba(0,0,0,0.3)]">
            {/* PHẦN HIỂN THỊ CHI TIẾT SHELF (GIỮ NGUYÊN) */}
            {activeShelf && (
              <div className="!p-5">
                <div className="!flex !justify-between !items-start !mb-5">
                  <h3 className="!text-[#10b981] !font-bold !text-lg !m-0">
                    Shelf Details
                  </h3>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="!bg-transparent !border-none !text-slate-400 hover:!text-white !cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="!bg-slate-700/50 !p-3 !rounded-xl !mb-4">
                  <p className="!text-xs !text-slate-400 !m-0 !mb-1">
                    Shelf Code:{" "}
                    <span className="!text-white !font-bold">
                      {activeShelf.code}
                    </span>
                  </p>
                  <p className="!text-[10px] !text-slate-500 !m-0 !truncate">
                    ID: {activeShelf.id}
                  </p>
                </div>

                <div className="!mt-4">
                  <p className="!text-xs !text-[#10b981] !font-bold !mb-4 !flex !items-center !gap-2">
                    ACCESS POINTS (SIDES)
                  </p>
                  <div className="!flex !flex-col !gap-3">
                    {["top", "bottom", "left", "right"].map((side) => {
                      const isChecked = activeShelf.accessNodes?.some(
                        (n) => n.side === side,
                      );
                      return (
                        <label
                          key={side}
                          className="!flex !items-center !text-sm !text-slate-200 !cursor-pointer !p-2 !bg-slate-700/50 !rounded-md !border !border-slate-600"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() =>
                              handleToggleAccessNode(
                                activeShelf.zoneId,
                                activeShelf.id,
                                side,
                              )
                            }
                            className="!cursor-pointer"
                          />
                          <span className="!ml-3 !capitalize">{side} Side</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="!mt-6">
                  <p className="!text-xs !text-[#10b981] !font-bold !mb-4 !flex !items-center !gap-2">
                    DIMENSIONS
                  </p>
                  <div className="!flex !flex-col !gap-3">
                    <div className="!flex !justify-between !items-center !bg-slate-700/50 !p-2 !rounded-md !border !border-slate-600">
                      <span className="!text-sm !text-slate-200">Width</span>
                      <input
                        type="number"
                        value={activeShelf.width ?? 0}
                        onChange={(e) =>
                          handleUpdateShelfDimension(
                            activeShelf.zoneId,
                            activeShelf.id,
                            "width",
                            e.target.value,
                          )
                        }
                        className="!w-24 !p-1 !bg-slate-800 !text-white !rounded !border !border-slate-600 !outline-none focus:!border-[#10b981] !text-right"
                      />
                    </div>
                    <div className="!flex !justify-between !items-center !bg-slate-700/50 !p-2 !rounded-md !border !border-slate-600">
                      {/* Note: Length in UI corresponds to Canvas/Internal Height (2D Depth) */}
                      <span className="!text-sm !text-slate-200">Length</span>
                      <input
                        type="number"
                        value={activeShelf.height ?? 0}
                        onChange={(e) =>
                          handleUpdateShelfDimension(
                            activeShelf.zoneId,
                            activeShelf.id,
                            "height",
                            e.target.value,
                          )
                        }
                        className="!w-24 !p-1 !bg-slate-800 !text-white !rounded !border !border-slate-600 !outline-none focus:!border-[#10b981] !text-right"
                      />
                    </div>
                    <div className="!flex !justify-between !items-center !bg-slate-700/50 !p-2 !rounded-md !border !border-slate-600">
                      {/* Note: Height in UI corresponds to Real-world verticalHeight (Not visual) */}
                      <span className="!text-sm !text-slate-200">Height</span>
                      <input
                        type="number"
                        value={activeShelf.verticalHeight ?? 0}
                        onChange={(e) =>
                          handleUpdateShelfDimension(
                            activeShelf.zoneId,
                            activeShelf.id,
                            "verticalHeight",
                            e.target.value,
                          )
                        }
                        className="!w-24 !p-1 !bg-slate-800 !text-white !rounded !border !border-slate-600 !outline-none focus:!border-[#10b981] !text-right"
                      />
                    </div>
                  </div>
                </div>

                <div className="!mt-6">
                  <div className="!flex !justify-between !items-center !mb-3">
                    <p className="!text-xs !text-[#10b981] !font-bold !m-0">
                      LEVELS & BINS
                    </p>
                    <button
                      onClick={() =>
                        handleAddLevel(activeShelf.zoneId, activeShelf.id)
                      }
                      className="!bg-[#3b82f6] !text-white !border-none !px-2 !py-1 !rounded !text-[10px] !font-bold !cursor-pointer"
                    >
                      + Add Level
                    </button>
                  </div>

                  <div className="!flex !flex-col !gap-3 !max-h-[300px] !overflow-y-auto !pr-1">
                    {(activeShelf.levels || []).map((level) => (
                      <div
                        key={level.id}
                        className="!bg-slate-700/50 !p-3 !rounded-md !border !border-slate-600"
                      >
                        <div className="!flex !justify-between !items-center !mb-2">
                          <span className="!text-xs !font-bold !text-slate-200">
                            {level.name}
                          </span>
                          <div>
                            <button
                              onClick={() =>
                                handleAddBin(
                                  activeShelf.zoneId,
                                  activeShelf.id,
                                  level.id,
                                )
                              }
                              className="!bg-transparent !border-none !text-[#3b82f6] !cursor-pointer !text-[11px] !mr-2"
                            >
                              + Bin
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteLevel(
                                  activeShelf.zoneId,
                                  activeShelf.id,
                                  level.id,
                                )
                              }
                              className="!bg-transparent !border-none !text-rose-400 !cursor-pointer !text-[11px]"
                            >
                              Del
                            </button>
                          </div>
                        </div>

                        <div className="!flex !flex-col !gap-2">
                          {level.bins?.map((bin) => (
                            <div
                              key={bin.id}
                              className={`!flex !justify-between !items-center !px-2 !py-1.5 !rounded !text-[10px] !text-slate-300 !border ${
                                bin.status === "inactive"
                                  ? "!bg-slate-800/80 !border-slate-700 !text-slate-500"
                                  : "!bg-slate-800 !border-slate-600"
                              }`}
                            >
                              <span className="!font-medium">{bin.name}</span>

                              <div className="!flex !items-center !gap-2">
                                <select
                                  value={bin.status || "active"}
                                  onChange={(e) =>
                                    handleUpdateBinStatus(
                                      activeShelf.zoneId,
                                      activeShelf.id,
                                      level.id,
                                      bin.id,
                                      e.target.value,
                                    )
                                  }
                                  className={`!text-[9px] !rounded !px-1 !py-0.5 !border-none !outline-none !cursor-pointer ${
                                    bin.status === "inactive"
                                      ? "!bg-rose-500/20 !text-rose-400"
                                      : "!bg-emerald-500/20 !text-emerald-400"
                                  }`}
                                >
                                  <option
                                    value="active"
                                    className="!bg-slate-800 !text-emerald-400"
                                  >
                                    Active
                                  </option>
                                  <option
                                    value="inactive"
                                    className="!bg-slate-800 !text-rose-400"
                                  >
                                    Inactive
                                  </option>
                                </select>

                                <button
                                  onClick={() =>
                                    handleDeleteBin(
                                      activeShelf.zoneId,
                                      activeShelf.id,
                                      level.id,
                                      bin.id,
                                    )
                                  }
                                  className="!bg-transparent !border-none !text-slate-500 hover:!text-rose-400 !cursor-pointer !text-[12px] !p-0 !leading-none"
                                  title="Delete Bin"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                          {(!level.bins || level.bins.length === 0) && (
                            <span className="!text-[10px] !text-slate-500 !italic">
                              No bins
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!activeShelf.levels ||
                      activeShelf.levels.length === 0) && (
                      <p className="!text-[11px] !text-slate-500 !italic !text-center !my-3">
                        No levels added yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- ADDED: FEATURE PHẦN HIỂN THỊ CHI TIẾT ZONE --- */}
            {activeZone && (
              <div className="!p-5">
                <div className="!flex !justify-between !items-start !mb-5">
                  <h3 className="!text-[#39c6c6] !font-bold !text-lg !m-0">
                    Zone Details
                  </h3>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="!bg-transparent !border-none !text-slate-400 hover:!text-white !cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="!bg-slate-700/50 !p-3 !rounded-xl !mb-4">
                  <p className="!text-xs !text-slate-400 !m-0 !mb-1">
                    Zone Name:{" "}
                    <span className="!text-white !font-bold">
                      {activeZone.name}
                    </span>
                  </p>
                  <p className="!text-[10px] !text-slate-500 !m-0 !truncate">
                    ID: {activeZone.id}
                  </p>
                </div>

                <div className="!mt-4">
                  <p className="!text-xs !text-[#39c6c6] !font-bold !mb-4 !flex !items-center !gap-2">
                    ENVIRONMENTAL REQUIREMENTS
                  </p>
                  <div className="!flex !flex-col !gap-3">
                    <label className="!flex !items-center !text-sm !text-slate-200 !cursor-pointer !p-2 !bg-slate-700/50 !rounded-md !border !border-slate-600">
                      <input
                        type="checkbox"
                        checked={
                          activeZone.isEsd === true || activeZone.isESD === true
                        }
                        onChange={(e) => {
                          handleUpdateZone(
                            activeZone.id,
                            "isEsd",
                            e.target.checked,
                          );
                          handleUpdateZone(
                            activeZone.id,
                            "isESD",
                            e.target.checked,
                          );
                        }}
                        className="!cursor-pointer"
                      />
                      <span className="!ml-3">Requires ESD (Anti-static)</span>
                    </label>

                    <label className="!flex !items-center !text-sm !text-slate-200 !cursor-pointer !p-2 !bg-slate-700/50 !rounded-md !border !border-slate-600">
                      <input
                        type="checkbox"
                        checked={
                          activeZone.isMsd === true || activeZone.isMSD === true
                        }
                        onChange={(e) => {
                          handleUpdateZone(
                            activeZone.id,
                            "isMsd",
                            e.target.checked,
                          );
                          handleUpdateZone(
                            activeZone.id,
                            "isMSD",
                            e.target.checked,
                          );
                        }}
                        className="!cursor-pointer"
                      />
                      <span className="!ml-3">
                        Requires MSD (Moisture control)
                      </span>
                    </label>
                    <label className="!flex !items-center !text-sm !text-slate-200 !cursor-pointer !p-2 !bg-slate-700/50 !rounded-md !border !border-slate-600">
                      <input
                        type="checkbox"
                        checked={activeZone.isCold === true}
                        onChange={(e) =>
                          handleUpdateZone(
                            activeZone.id,
                            "isCold",
                            e.target.checked,
                          )
                        }
                        className="!cursor-pointer"
                      />
                      <span className="!ml-3">Cold Storage</span>
                    </label>
                    <label className="!flex !items-center !text-sm !text-slate-200 !cursor-pointer !p-2 !bg-slate-700/50 !rounded-md !border !border-slate-600">
                      <input
                        type="checkbox"
                        checked={activeZone.isVulnerable === true}
                        onChange={(e) =>
                          handleUpdateZone(
                            activeZone.id,
                            "isVulnerable",
                            e.target.checked,
                          )
                        }
                        className="!cursor-pointer"
                      />
                      <span className="!ml-3">Vulnerable / Fragile</span>
                    </label>
                    <label className="!flex !items-center !text-sm !text-slate-200 !cursor-pointer !p-2 !bg-slate-700/50 !rounded-md !border !border-slate-600">
                      <input
                        type="checkbox"
                        checked={activeZone.isHighValue === true}
                        onChange={(e) =>
                          handleUpdateZone(
                            activeZone.id,
                            "isHighValue",
                            e.target.checked,
                          )
                        }
                        className="!cursor-pointer"
                      />
                      <span className="!ml-3">High Value / Secure</span>
                    </label>
                  </div>
                </div>

                <div className="!mt-6">
                  <p className="!text-xs !text-[#39c6c6] !font-bold !mb-4 !flex !items-center !gap-2">
                    ZONE TYPE
                  </p>
                  <select
                    value={activeZone.zoneType || "NORMAL"}
                    onChange={(e) =>
                      handleUpdateZone(
                        activeZone.id,
                        "zoneType",
                        e.target.value,
                      )
                    }
                    className="!w-full !p-2 !bg-slate-700/50 !text-slate-200 !rounded-md !border !border-slate-600 !outline-none focus:!border-[#39c6c6]"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="COLD">Cold Storage</option>
                    <option value="HAZARDOUS">Hazardous Material</option>
                    <option value="BATTERY">Battery Storage</option>
                    <option value="VALUABLE">Valuable/Secure</option>
                  </select>
                </div>
              </div>
            )}

            {activeNode && (
              <div className="!p-5">
                <div className="!flex !justify-between !items-start !mb-5">
                  <h3 className="!text-[#39c6c6] !font-bold !text-lg !m-0">
                    Node Details
                  </h3>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="!bg-transparent !border-none !text-slate-400 hover:!text-white !cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="!bg-slate-700/50 !p-3 !rounded-xl !mb-4">
                  <p className="!text-xs !text-slate-400 !m-0 !mb-1">
                    Node ID:{" "}
                    <span className="!text-white !font-bold">
                      {activeNode.id}
                    </span>
                  </p>
                </div>

                <div className="!mt-4">
                  <p className="!text-xs !text-[#39c6c6] !font-bold !mb-4 !flex !items-center !gap-2">
                    NODE TYPE
                  </p>
                  <select
                    value={activeNode.type || "nav"}
                    onChange={(e) =>
                      handleUpdateNode(activeNode.id, "type", e.target.value)
                    }
                    className="!w-full !p-2 !bg-slate-700/50 !text-slate-200 !rounded-md !border !border-slate-600 !outline-none focus:!border-[#39c6c6]"
                  >
                    <option value="nav">Navigation (nav)</option>
                    <option value="start">Start Point (start)</option>
                    <option value="finish">Finish Point (finish)</option>
                  </select>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </ConfigProvider>
  );
};

export default WarehouseConfiguration;
