import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import CompanyAdminSidebar from "../../components/CompanyAdminSidebar";
import CompanyAdminHeader from "../../components/CompanyAdminHeader";
import ScrollToTop from "../../components/ScrollToTop";

const CompanyAdminApp = () => {
  const navigate = useNavigate();

  // 1. Khởi tạo state từ localStorage để ghi nhớ trạng thái khi F5
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved ? JSON.parse(saved) : false;
  });

  // 2. Lưu trạng thái vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // 3. Kiểm tra quyền truy cập
  useEffect(() => {
    const token = localStorage.getItem("token");
    const roleId = localStorage.getItem("roleId");
    if (!roleId || !token) {
      navigate("/auth");
    } else if (roleId === "1") {
      navigate("/super-admin/dashboard");
    } else if (roleId === "3") {
      navigate("/manager/dashboard");
    }
  }, [navigate]);

  return (
    <div className="!flex !min-h-screen !bg-slate-50">
      <ScrollToTop />

      {/* Sidebar nhận state và hàm set */}
      <CompanyAdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className="!flex-1 !flex !flex-col !min-w-0">
        {/* Header nhận state để điều chỉnh độ thụt lùi (left) */}
        <CompanyAdminHeader isCollapsed={isCollapsed} />

        {/* Nội dung chính điều chỉnh ml-64 hoặc ml-20 */}
        <main
          className={`!flex-1 !transition-all !duration-300 ${
            isCollapsed ? "!ml-20" : "!ml-64"
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

export default CompanyAdminApp;
