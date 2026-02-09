import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserCircle,
  Box,
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  Warehouse,
  Menu,
  Truck, // Thêm icon Supplier
} from "lucide-react";
import { Tooltip } from "antd";
import chooseImage from "../assets/images";

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

const CompanyAdminSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();

  return (
    <aside
      className={`!fixed !left-0 !top-0 !h-screen !bg-white !border-r !border-slate-100 !flex !flex-col !z-50 !transition-all !duration-300 ${
        isCollapsed ? "!w-20" : "!w-60"
      }`}
    >
      <div
        className={`!flex !items-center !mb-10 !mt-3 !px-4 ${
          isCollapsed ? "!justify-center" : "!justify-between"
        }`}
      >
        {!isCollapsed && (
          <img
            className="!h-10 !cursor-pointer"
            onClick={() => navigate("/company-admin/dashboard")}
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

      <div className="!flex-1 !px-4 !py-2 !space-y-1 !overflow-y-auto !overflow-x-hidden">
        {!isCollapsed && (
          <p className="!px-4 !text-[11px] !font-black !text-slate-400 !uppercase !tracking-widest !mb-3">
            Main Menu
          </p>
        )}

        <SidebarItem
          to="dashboard"
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          to="account-management"
          icon={<UserCircle size={20} />}
          label="Account"
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          to="product-management"
          icon={<Box size={20} />}
          label="Product"
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          to="warehouse-management"
          icon={<Warehouse size={20} />}
          label="Warehouse"
          isCollapsed={isCollapsed}
        />
        {/* TAB SUPPLIER MỚI ĐƯỢC THÊM TẠI ĐÂY */}
        <SidebarItem
          to="supplier-management"
          icon={<Truck size={20} />}
          label="Supplier"
          isCollapsed={isCollapsed}
        />

        <div className="!pt-6">
          {!isCollapsed && (
            <p className="!px-4 !text-[11px] !font-black !text-slate-400 !uppercase !tracking-widest !mb-3">
              Operations
            </p>
          )}
          <SidebarItem
            to="inbound-request-management"
            icon={<ArrowDownCircle size={20} />}
            label="Inbound Request"
            isCollapsed={isCollapsed}
          />
          <SidebarItem
            to="outbound-management"
            icon={<ArrowUpCircle size={20} />}
            label="Outbound"
            isCollapsed={isCollapsed}
          />
        </div>
      </div>

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
