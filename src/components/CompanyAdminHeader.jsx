import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  AlertCircle, // Thêm icon cảnh báo
} from "lucide-react";

const CompanyAdminHeader = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // State kiểm soát bảng xác nhận
  const dropdownRef = useRef(null);

  const userName = localStorage.getItem("userName") || "Lê Cao Kha";

  // Hàm thực hiện đăng xuất thực sự
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roleId");
    navigate("/");
    console.log("Logged out successfully");
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-64 right-0 h-15 bg-white border-b border-slate-100 flex items-center justify-end px-8 z-40">
        <div className="flex items-center gap-6">
          {/* --- NOTIFICATION BELL --- */}
          <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
            <Bell size={22} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          {/* --- PROFILE & DROPDOWN --- */}
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 pl-6 border-l border-slate-100 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-[#39c6c6]/50 group-hover:border-[#39c6c6] transition-all shadow-sm">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
                  alt="User Avatar"
                  className="w-full h-full object-cover bg-slate-100"
                />
              </div>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </div>

            {/* Dropdown Menu Content */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in duration-150">
                <div className="px-4 py-2 border-b border-slate-50 mb-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Account
                  </p>
                </div>

                <button
                  onClick={() => {
                    navigate("/company-admin/profile");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <User size={16} /> My Profile
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <Settings size={16} /> Settings
                </button>

                <div className="h-px bg-slate-50 my-1"></div>

                {/* Nút Logout: Mở bảng xác nhận thay vì thoát ngay */}
                <div className="flex justify-center items-center">
                  <button
                    onClick={() => {
                      setShowConfirm(true); // Hiện bảng xác nhận
                      setIsDropdownOpen(false); // Đóng dropdown
                    }}
                    className="w-[92%] mt-0.5 rounded-xl flex items-center gap-3 px-2.5 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-bold"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- CONFIRMATION MODAL --- */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Lớp nền mờ (Backdrop) */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowConfirm(false)}
          ></div>

          {/* Nội dung Modal */}
          <div className="relative bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl transition-all animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-red-50 text-red-500 rounded-2xl mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Sign Out?
              </h3>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Are you sure you want to log out?
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-shadow shadow-lg shadow-red-200"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyAdminHeader;
