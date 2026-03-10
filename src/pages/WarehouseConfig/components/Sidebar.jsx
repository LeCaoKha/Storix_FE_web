import React from "react";
import {
  Layers,
  Route,
  Plus,
  Trash2,
  RotateCcw,
  Download,
  Box,
  HelpCircle,
  Package,
} from "lucide-react";
import { GRID_SIZE, COLOR_SELECTION } from "../constants";

/**
 * Sidebar panel with design mode toggle, warehouse size inputs,
 * action buttons, and help instructions.
 * Uses Tailwind CSS matching project design system.
 */
const Sidebar = ({
  designMode,
  setDesignMode,
  setActiveNodeId,
  whSize,
  setWhSize,
  addZone,
  addShelf,
  deleteItems,
  undo,
  exportWarehouseConfig,
  selectedIds,
}) => {
  return (
    <div className="!w-[260px] !bg-white !border-r !border-slate-100 !flex !flex-col !p-5 !z-10">
      {/* Header */}
      <h2 className="!text-xl !font-bold !text-slate-800 !mb-6 !flex !items-center !gap-2">
        <Layers className="!text-[#39c6c6]" size={24} />
        Storix Pro
      </h2>

      {/* Design Mode Toggle */}
      <div className="!bg-slate-50 !rounded-2xl !p-4 !mb-4">
        <p className="!text-xs !font-bold !text-slate-500 !uppercase !tracking-wide !mb-3">
          Chế độ thiết kế
        </p>
        <div className="!flex !gap-2">
          <button
            className={`!flex-1 !py-2.5 !px-3 !rounded-xl !text-sm !font-bold !transition-all ${
              designMode === "OBJECT"
                ? "!bg-[#39c6c6] !text-white !shadow-lg !shadow-[#39c6c6]/20"
                : "!bg-white !text-slate-500 !border !border-slate-200 hover:!border-[#39c6c6] hover:!text-[#39c6c6]"
            }`}
            onClick={() => {
              setDesignMode("OBJECT");
              setActiveNodeId(null);
            }}
          >
            <div className="!flex !items-center !justify-center !gap-2">
              <Box size={16} />
              Vật thể
            </div>
          </button>
          <button
            className={`!flex-1 !py-2.5 !px-3 !rounded-xl !text-sm !font-bold !transition-all ${
              designMode === "NAV"
                ? "!bg-[#39c6c6] !text-white !shadow-lg !shadow-[#39c6c6]/20"
                : "!bg-white !text-slate-500 !border !border-slate-200 hover:!border-[#39c6c6] hover:!text-[#39c6c6]"
            }`}
            onClick={() => setDesignMode("NAV")}
          >
            <div className="!flex !items-center !justify-center !gap-2">
              <Route size={16} />
              Đường đi
            </div>
          </button>
        </div>
      </div>

      {/* Warehouse Size Inputs */}
      <div className="!bg-slate-50 !rounded-2xl !p-4 !mb-4">
        <p className="!text-xs !font-bold !text-slate-500 !uppercase !tracking-wide !mb-3">
          Kích thước kho (m)
        </p>
        <div className="!flex !gap-2">
          <div className="!flex-1">
            <label className="!text-xs !text-slate-400 !block !mb-1">
              Rộng
            </label>
            <input
              type="number"
              value={whSize.width / GRID_SIZE}
              onChange={(e) =>
                setWhSize({
                  ...whSize,
                  width: Number(e.target.value) * GRID_SIZE,
                })
              }
              className="!w-full !h-10 !px-3 !bg-white !border !border-slate-200 !rounded-xl !text-sm !font-semibold !text-slate-600 focus:!outline-none focus:!border-[#39c6c6] focus:!ring-2 focus:!ring-[#39c6c6]/20"
            />
          </div>
          <div className="!flex-1">
            <label className="!text-xs !text-slate-400 !block !mb-1">Cao</label>
            <input
              type="number"
              value={whSize.height / GRID_SIZE}
              onChange={(e) =>
                setWhSize({
                  ...whSize,
                  height: Number(e.target.value) * GRID_SIZE,
                })
              }
              className="!w-full !h-10 !px-3 !bg-white !border !border-slate-200 !rounded-xl !text-sm !font-semibold !text-slate-600 focus:!outline-none focus:!border-[#39c6c6] focus:!ring-2 focus:!ring-[#39c6c6]/20"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <button
        className="!w-full !py-3 !px-4 !mb-2.5 !bg-slate-800 !text-white !rounded-xl !font-bold !text-sm !transition-all hover:!bg-slate-700 !flex !items-center !justify-center !gap-2"
        onClick={addZone}
      >
        <Plus size={18} />
        [D] Thêm Zone
      </button>

      <button
        className="!w-full !py-3 !px-4 !mb-2.5 !bg-emerald-500 !text-white !rounded-xl !font-bold !text-sm !transition-all hover:!bg-emerald-600 !flex !items-center !justify-center !gap-2 !shadow-lg !shadow-emerald-500/20"
        onClick={addShelf}
      >
        <Package size={18} />
        [R] Thêm Kệ
      </button>

      <button
        className="!w-full !py-3 !px-4 !mb-2.5 !bg-red-500 !text-white !rounded-xl !font-bold !text-sm !transition-all hover:!bg-red-600 !flex !items-center !justify-center !gap-2 !shadow-lg !shadow-red-500/20 disabled:!opacity-50 disabled:!cursor-not-allowed"
        onClick={deleteItems}
        disabled={selectedIds.length === 0}
      >
        <Trash2 size={18} />
        Xóa chọn
      </button>

      <button
        className="!w-full !py-3 !px-4 !mb-3 !bg-[#39c6c6] !text-white !rounded-xl !font-bold !text-sm !transition-all hover:!bg-[#2eb1b1] !flex !items-center !justify-center !gap-2 !shadow-lg !shadow-[#39c6c6]/20"
        onClick={undo}
      >
        <RotateCcw size={18} />
        Ctrl+Z (Undo)
      </button>

      <button
        className="!w-full !py-3 !px-4 !mb-4 !bg-purple-500 !text-white !rounded-xl !font-bold !text-sm !transition-all hover:!bg-purple-600 !flex !items-center !justify-center !gap-2 !shadow-lg !shadow-purple-500/20"
        onClick={exportWarehouseConfig}
      >
        <Download size={18} />
        Xuất cấu hình JSON
      </button>

      {/* Help Box */}
      <div className="!mt-auto !bg-slate-50 !rounded-2xl !p-4 !border !border-slate-100">
        <div className="!flex !items-center !gap-2 !mb-2">
          <HelpCircle size={16} className="!text-slate-400" />
          <p className="!text-xs !font-bold !text-slate-500 !uppercase !tracking-wide">
            Hướng dẫn
          </p>
        </div>
        <p className="!text-xs !text-slate-500 !leading-relaxed">
          <span className="!font-bold !text-slate-600">
            Chọn nhiều (Object):
          </span>
          <br />
          • Ctrl + Chuột trái kéo: Chọn vùng (marquee)
          <br />
          • Chuột trái trên element: Kéo di chuyển
          <br />
          <span className="!font-bold !text-slate-600">Vẽ đường đi:</span>
          <br />
          1. Click vùng trống: Tạo Node
          <br />
          2. Shift + Click: Nối 2 Node
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
