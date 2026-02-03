import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  AlertCircle,
} from "lucide-react";
import api from "../api/axios";

const CompanyAdminHeader = ({ isCollapsed }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const dropdownRef = useRef(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      try {
        const res = await api.get(`/Users/get-user-profile/${userId}`);
        setUserProfile(res.data);
      } catch (error) {
        console.error("Error fetching header profile:", error);
      }
    };
    fetchUserProfile();
  }, [userId]);

  const fullName = userProfile?.fullName || "User";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header
        className={`!fixed !top-0 !right-0 !h-15 !bg-white !border-b !border-slate-100 !flex !items-center !justify-end !px-8 !z-40 !transition-all !duration-300 ${
          isCollapsed ? "!left-20" : "!left-64"
        }`}
      >
        <div className="!flex !items-center !gap-6">
          <button className="!relative !p-2 !text-slate-400 hover:!bg-slate-50 !rounded-full !transition-colors">
            <Bell size={22} />
            <span className="!absolute !top-2.5 !right-2.5 !w-2 !h-2 !bg-red-500 !rounded-full !border-2 !border-white"></span>
          </button>

          <div className="!relative" ref={dropdownRef}>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="!flex !items-center !gap-3 !pl-6 !border-l !border-slate-100 !group !cursor-pointer"
            >
              <span className="!text-sm !font-bold !text-slate-700 !hidden md:!block">
                {fullName}
              </span>
              <div className="!w-10 !h-10 !rounded-xl !overflow-hidden !border-2 !border-[#39c6c6]/50 group-hover:!border-[#39c6c6] !transition-all !shadow-sm">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`}
                  alt="Avatar"
                  className="!w-full !h-full !object-cover !bg-slate-100"
                />
              </div>
              <ChevronDown
                size={16}
                className={`!text-slate-400 !transition-transform !duration-200 ${isDropdownOpen ? "!rotate-180" : ""}`}
              />
            </div>

            {isDropdownOpen && (
              <div className="!absolute !right-0 !mt-3 !w-52 !bg-white !rounded-2xl !shadow-xl !border !border-slate-100 !py-2 !animate-in !fade-in !zoom-in !duration-150">
                <button
                  onClick={() => {
                    navigate(`/company-admin/profile/${userId}`);
                    setIsDropdownOpen(false);
                  }}
                  className="!w-full !flex !items-center !gap-3 !px-4 !py-2.5 !text-sm !text-slate-600 hover:!bg-slate-50 !transition-colors"
                >
                  <User size={16} /> My Profile
                </button>
                <button className="!w-full !flex !items-center !gap-3 !px-4 !py-2.5 !text-sm !text-slate-600 hover:!bg-slate-50 !transition-colors">
                  <Settings size={16} /> Settings
                </button>
                <div className="!h-px !bg-slate-50 !my-1"></div>
                <button
                  onClick={() => {
                    setShowConfirm(true);
                    setIsDropdownOpen(false);
                  }}
                  className="!w-[92%] !mx-auto !mt-0.5 !rounded-xl !flex !items-center !gap-3 !px-2.5 !py-2.5 !text-sm !text-red-500 hover:!bg-red-50 !transition-colors !font-bold"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Modal */}
      {showConfirm && (
        <div className="!fixed !inset-0 !z-[100] !flex !items-center !justify-center !p-4">
          <div
            className="!absolute !inset-0 !bg-slate-900/40 !backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          ></div>
          <div className="!relative !bg-white !rounded-[2.5rem] !p-8 !max-w-sm !w-full !shadow-2xl !text-center">
            <div className="!p-4 !bg-red-50 !text-red-500 !rounded-2xl !inline-block !mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="!text-xl !font-bold !text-slate-800 !mb-2">
              Sign Out?
            </h3>
            <p className="!text-slate-500 !mb-8">
              Are you sure you want to log out?
            </p>
            <div className="!flex !gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="!flex-1 !py-3 !bg-slate-100 hover:!bg-slate-200 !text-slate-600 !font-bold !rounded-2xl"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="!flex-1 !py-3 !bg-red-500 hover:!bg-red-600 !text-white !font-bold !rounded-2xl !shadow-lg !shadow-red-200"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyAdminHeader;
