import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserCircle,
  Box,
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  Warehouse,
  Menu,
  Truck,
  BarChart3,
  Archive,
  ClipboardList,
  ChevronDown,
  ArrowRightLeft,
} from "lucide-react";
import { Tooltip } from "antd";
import chooseImage from "../assets/images";

// --- SUB-COMPONENT: SIDEBAR ITEM (Link Đơn) ---
const SidebarItem = ({ to, icon, label, isCollapsed }) => (
  <Tooltip
    title={isCollapsed ? label : ""}
    placement="right"
    mouseEnterDelay={0.1}
  >
    <NavLink
      to={to}
      className={({ isActive }) =>
        `!flex !items-center !gap-3 !px-4 !py-3 !rounded-xl !transition-all !duration-300 ${
          isActive
            ? "!bg-[#39c6c6]/10 !text-[#39c6c6] !font-semibold"
            : "!text-slate-500 hover:!bg-slate-50 hover:!text-slate-700"
        } ${isCollapsed ? "!justify-center !px-0 !mx-0" : ""}`
      }
    >
      <div className="!shrink-0">{icon}</div>
      {!isCollapsed && <span className="!text-sm !truncate">{label}</span>}
    </NavLink>
  </Tooltip>
);

// --- SUB-COMPONENT: SIDEBAR SUB-MENU (Dropdown) ---
const SidebarSubMenu = ({
  icon,
  label,
  isCollapsed,
  isOpen,
  onToggle,
  isActive,
  children,
}) => (
  <div className="!flex !flex-col">
    <Tooltip
      title={isCollapsed ? label : ""}
      placement="right"
      mouseEnterDelay={0.1}
    >
      <button
        onClick={onToggle}
        className={`!w-full !flex !items-center !justify-between !px-4 !py-3 !rounded-xl !transition-all !duration-300 ${
          isActive
            ? "!bg-[#39c6c6]/10 !text-[#39c6c6] !font-semibold"
            : "!text-slate-500 hover:!bg-slate-50 hover:!text-slate-700"
        } ${isCollapsed ? "!justify-center !px-0 !mx-0" : ""}`}
      >
        <div className="!flex !items-center !gap-3">
          <div className="!shrink-0">{icon}</div>
          {!isCollapsed && <span className="!text-sm !truncate">{label}</span>}
        </div>
        {!isCollapsed && (
          <div
            className={`!transition-transform !duration-300 ${
              isOpen ? "!rotate-180 text-[#39c6c6]" : "text-slate-400"
            }`}
          >
            <ChevronDown size={16} />
          </div>
        )}
      </button>
    </Tooltip>

    {isOpen && !isCollapsed && (
      <div className="!flex !flex-col !gap-1 !mt-1">{children}</div>
    )}
  </div>
);

// --- SUB-COMPONENT: SIDEBAR SUB-ITEM (Link con bên trong Dropdown) ---
const SidebarSubItem = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `!flex !items-center !pl-12 !pr-4 !py-2.5 !rounded-xl !transition-all !duration-300 ${
        isActive
          ? "!bg-[#39c6c6]/10 !text-[#39c6c6] !font-semibold"
          : "!text-slate-500 hover:!bg-slate-50 hover:!text-slate-700"
      }`
    }
  >
    <span className="!text-sm !truncate">{label}</span>
  </NavLink>
);

// --- MAIN COMPONENT: SIDEBAR ---
const CompanyAdminSidebar = ({
  isCollapsed,
  setIsCollapsed,
  basePath = "/company-admin",
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Quản lý trạng thái đóng/mở của các Dropdown
  const [openMenus, setOpenMenus] = useState({
    inbound: false,
    outbound: false,
  });

  // Lấy thông tin từ localStorage
  const roleId = Number(localStorage.getItem("roleId"));
  const warehouseId = localStorage.getItem("warehouseId");

  // Hàm xử lý đóng mở Menu
  const handleToggleMenu = (menuKey) => {
    if (isCollapsed) {
      // Nếu sidebar đang thu gọn, click vào thì tự động mở rộng sidebar và mở menu đó
      setIsCollapsed(false);
      setOpenMenus((prev) => ({ ...prev, [menuKey]: true }));
    } else {
      // Toggle bình thường
      setOpenMenus((prev) => ({ ...prev, [menuKey]: !prev[menuKey] }));
    }
  };

  // Xác định xem URL hiện tại có đang nằm trong nhánh Inbound/Outbound hay không để highlight icon cha
  const isInboundActive = location.pathname.includes("inbound");
  const isOutboundActive = location.pathname.includes("outbound");

  return (
    <aside
      className={`!fixed !left-0 !top-0 !h-screen !bg-white !border-r !border-slate-100 !flex !flex-col !z-50 !transition-all !duration-300 ${
        isCollapsed ? "!w-20" : "!w-60"
      }`}
    >
      {/* HEADER: LOGO & TOGGLE BUTTON */}
      <div
        className={`!flex !items-center !mb-10 !mt-3 !px-4 ${
          isCollapsed ? "!justify-center" : "!justify-between"
        }`}
      >
        {!isCollapsed && (
          <img
            className="!h-10 !cursor-pointer"
            onClick={() => navigate(`${basePath}/dashboard`)}
            src={chooseImage("logoStorixWithText")}
            alt="Logo"
          />
        )}

        <Tooltip title={isCollapsed ? "Expand" : "Collapse"} placement="right">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="!p-3 !rounded-full hover:!bg-slate-50 !text-slate-500 !transition-colors"
          >
            <Menu size={22} />
          </button>
        </Tooltip>
      </div>

      {/* NAVIGATION ITEMS */}
      <div className="!flex-1 !px-4 !py-2 !space-y-1 !overflow-y-auto !overflow-x-hidden">
        {/* --- SECTION: MAIN MENU --- */}
        <div className="!mb-6">
          {!isCollapsed && (
            <p className="!px-4 !text-[11px] !font-black !text-slate-400 !uppercase !tracking-widest !mb-3">
              Main Menu
            </p>
          )}

          {/* Dashboard */}
          {(roleId === 2 || roleId === 3 || roleId === 4) && (
            <SidebarItem
              to="dashboard"
              icon={<LayoutDashboard size={20} />}
              label="Dashboard"
              isCollapsed={isCollapsed}
            />
          )}

          {/* Account */}
          {roleId === 2 && (
            <SidebarItem
              to="account-management"
              icon={<UserCircle size={20} />}
              label="Account"
              isCollapsed={isCollapsed}
            />
          )}

          {/* Product */}
          {(roleId === 2 || roleId === 3) && (
            <SidebarItem
              to="product-management"
              icon={<Box size={20} />}
              label="Product"
              isCollapsed={isCollapsed}
            />
          )}

          {/* Warehouse */}
          {(roleId === 2 || roleId === 3) && (
            <SidebarItem
              to="warehouse-management"
              icon={<Warehouse size={20} />}
              label="Warehouse"
              isCollapsed={isCollapsed}
            />
          )}

          {/* Supplier, Reports */}
          {roleId === 2 && (
            <>
              <SidebarItem
                to="supplier-management"
                icon={<Truck size={20} />}
                label="Supplier"
                isCollapsed={isCollapsed}
              />
              <SidebarItem
                to="report-management"
                icon={<BarChart3 size={20} />}
                label="Reports"
                isCollapsed={isCollapsed}
              />
            </>
          )}
        </div>

        {/* --- SECTION: OPERATIONS --- */}
        <div>
          {!isCollapsed && (
            <p className="!px-4 !text-[11px] !font-black !text-slate-400 !uppercase !tracking-widest !mb-3">
              Operations
            </p>
          )}

          {/* INVENTORY */}
          {(roleId === 2 || roleId === 3 || roleId === 4) && (
            <SidebarItem
              to={
                roleId === 3 || roleId === 4
                  ? `inventory-management/details/${warehouseId}`
                  : "inventory-management"
              }
              icon={<Archive size={20} />}
              label="Inventory"
              isCollapsed={isCollapsed}
            />
          )}

          {/* INVENTORY COUNT */}
          {roleId === 3 && (
            <SidebarItem
              to="inventory-count"
              icon={<ClipboardList size={20} />}
              label="Inventory Count"
              isCollapsed={isCollapsed}
            />
          )}

          {/* ===== DROPDOWN INBOUND (Đã loại bỏ roleId === 2) ===== */}
          {(roleId === 3 || roleId === 4) && (
            <SidebarSubMenu
              icon={<ArrowDownCircle size={20} />}
              label="Inbound"
              isCollapsed={isCollapsed}
              isOpen={openMenus.inbound}
              isActive={isInboundActive}
              onToggle={() => handleToggleMenu("inbound")}
            >
              <SidebarSubItem
                to="inbound-request-management"
                label="Requests"
              />
              {roleId === 3 && (
                <SidebarSubItem
                  to="inbound-ticket-management"
                  label="Tickets"
                />
              )}
            </SidebarSubMenu>
          )}

          {/* ===== DROPDOWN OUTBOUND (Đã loại bỏ roleId === 2) ===== */}
          {(roleId === 3 || roleId === 4) && (
            <SidebarSubMenu
              icon={<ArrowUpCircle size={20} />}
              label="Outbound"
              isCollapsed={isCollapsed}
              isOpen={openMenus.outbound}
              isActive={isOutboundActive}
              onToggle={() => handleToggleMenu("outbound")}
            >
              <SidebarSubItem to="outbound-management" label="Requests" />
              {roleId === 3 && (
                <SidebarSubItem
                  to="outbound-ticket-management"
                  label="Tickets"
                />
              )}
            </SidebarSubMenu>
          )}

          {(roleId === 2 || roleId === 3) && (
            <SidebarItem
              to="warehouse-transfer-management"
              icon={<ArrowRightLeft size={20} />}
              label="Warehouse Transfer"
              isCollapsed={isCollapsed}
            />
          )}
        </div>
      </div>

      {/* FOOTER: VERSION INFO */}
      <div className="!mt-4 !mb-3 !text-center">
        {!isCollapsed && (
          <p className="!text-[10px] !font-bold !text-slate-400 !uppercase !tracking-[0.2em]">
            Storix v1.0.0
          </p>
        )}
      </div>
    </aside>
  );
};

export default CompanyAdminSidebar;
