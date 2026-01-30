import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import CompanyAdminSidebar from "../../components/CompanyAdminSidebar";
import CompanyAdminHeader from "../../components/CompanyAdminHeader"; // Import Header
import { authorizeRole } from "../../utils/utils";

const CompanyAdminApp = () => {
  // const navigate = useNavigate();
  // const token = localStorage.getItem("token");
  // const roleId = localStorage.getItem("roleId");

  // useEffect(() => {
  //   if (token && roleId) {
  //     authorizeRole(roleId, navigate);
  //   } else if (!token) {
  //     navigate("/auth");
  //   }
  // }, [token, roleId, navigate]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar cố định bên trái */}
      <CompanyAdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header cố định trên đầu */}
        <CompanyAdminHeader />

        {/* Main Content */}
        {/* ml-64 để tránh sidebar, pt-20 để tránh header */}
        <main className="flex-1 ml-64 pt-15 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompanyAdminApp;
