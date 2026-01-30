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
} from "lucide-react";
import chooseImage from "../assets/images";

const SidebarItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive
          ? "bg-[#39c6c6]/10 text-[#39c6c6] font-semibold"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`
    }
  >
    {icon}
    <span className="text-sm">{label}</span>
  </NavLink>
);

const CompanyAdminSidebar = () => {
  const navigate = useNavigate();

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 flex flex-col z-50">
        {/* --- HEADER: LOGO --- */}
        <div className="mb-3 mt-3 cursor-pointer flex justify-center items-center">
          <img
            className="h-[60%]"
            onClick={() => navigate("/company-admin/dashboard")}
            src={chooseImage("logoStorixWithText")}
            alt="Storix Logo"
          />
        </div>

        {/* --- NAVIGATION MENU --- */}
        <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          <p className="px-4 text-[13px] font-black text-slate-400 uppercase tracking-widest mb-3">
            Main Menu
          </p>

          <SidebarItem
            to="dashboard"
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
          />
          <SidebarItem
            to="account-management"
            icon={<UserCircle size={20} />}
            label="Account"
          />
          <SidebarItem
            to="product-management"
            icon={<Box size={20} />}
            label="Product"
          />

          <SidebarItem
            to="warehouse-management"
            icon={<Warehouse size={20} />}
            label="Warehouse"
          />

          <div className="pt-6">
            <p className="px-4 text-[13px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Operations
            </p>
            <SidebarItem
              to="inbound-management"
              icon={<ArrowDownCircle size={20} />}
              label="Inbound"
            />
            <SidebarItem
              to="outbound-management"
              icon={<ArrowUpCircle size={20} />}
              label="Outbound"
            />
          </div>

          <div className="pt-6">
            <p className="px-4 text-[13px] font-black text-slate-400 uppercase tracking-widest mb-3">
              Reports
            </p>
            <SidebarItem
              to="report-management"
              icon={<FileText size={20} />}
              label="Report"
            />
          </div>
        </div>

        {/* --- DECORATIVE FOOTER: HELP CARD --- */}
        <div className="mt-4 mb-3 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Storix v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
};

export default CompanyAdminSidebar;
