import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import CompanyAdminSidebar from "../../components/CompanyAdminSidebar";
import CompanyAdminHeader from "../../components/CompanyAdminHeader"; // Import Header
import ScrollToTop from "../../components/ScrollToTop";

const CompanyAdminApp = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const roleId = localStorage.getItem("roleId");

  const navigateBack = () => {
    if (!roleId || !token) {
      navigate("/auth");
    } else if (roleId === 1) {
      navigate("/super-admin/dashboard");
    } else if (roleId === 3) {
      navigate("/manager/dashboard");
    }
  };

  useEffect(() => {
    navigateBack();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar cố định bên trái */}
      <ScrollToTop />
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
