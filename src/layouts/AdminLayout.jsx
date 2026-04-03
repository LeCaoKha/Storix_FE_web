import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import CompanyAdminSidebar from "../components/CompanyAdminSidebar";
import CompanyAdminHeader from "../components/CompanyAdminHeader";
import ScrollToTop from "../components/ScrollToTop";

/**
 * Shared layout for both /company-admin and /manager routes.
 * Replaces the duplicate CompanyAdmin.jsx and Manager.jsx.
 *
 * @param {Object} props
 * @param {number[]} props.allowedRoles - Array of roleId numbers allowed to access this layout
 */
const AdminLayout = ({ allowedRoles }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract the base path prefix (e.g., "/company-admin" or "/manager")
  const basePath = "/" + location.pathname.split("/")[1];

  // 1. Initialize sidebar state from localStorage to persist across refreshes
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  // 2. Save sidebar state to localStorage on change
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // 3. Check access permissions
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const roleId = localStorage.getItem("roleId");

    if (!roleId || !token) {
      navigate("/auth");
      return;
    }

    const roleIdNum = Number(roleId);

    // If the current role is not in the allowed roles, redirect to the correct dashboard
    // if (!allowedRoles.includes(roleIdNum)) {
    //   if (roleIdNum === 1) {
    //     navigate("/super-admin/dashboard");
    //   } else if (roleIdNum === 2) {
    //     navigate("/company-admin/dashboard");
    //   } else if (roleIdNum === 3) {
    //     navigate("/manager/dashboard");
    //   } else {
    //     navigate("/auth");
    //   }
    // }
  }, [navigate, allowedRoles]);

  return (
    <div className="!flex !min-h-screen !bg-slate-50">
      <ScrollToTop />

      <CompanyAdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        basePath={basePath}
      />

      <div className="!flex-1 !flex !flex-col !min-w-0">
        <CompanyAdminHeader isCollapsed={isCollapsed} basePath={basePath} />

        <main
          className={`!flex-1 !transition-all !duration-300 ${
            isCollapsed ? "!ml-20" : "!ml-60"
          } !pt-15`}
        >
          <div className="">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
