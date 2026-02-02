import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Thêm useParams
import {
  Settings,
  Package,
  Navigation,
  LogOut,
  Calendar,
  ShieldCheck,
  Edit3,
  BarChart3,
  ChevronRight,
  Clock,
} from "lucide-react";
import { message, Spin } from "antd";
import api from "../../api/axios";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { id: urlUserId } = useParams(); // Lấy id từ URL (ví dụ: /profile/:id)
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const storedUserId = localStorage.getItem("userId");

  // 1. Fetch User Profile Logic
  useEffect(() => {
    const fetchProfile = async () => {
      // Ưu tiên id trên URL, nếu không có thì lấy trong localStorage
      const effectiveUserId = urlUserId || storedUserId;

      if (!effectiveUserId) {
        message.error("User ID not found!");
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        // Gọi API với ID đã được xác định
        const res = await api.get(`/Users/get-user-profile/${effectiveUserId}`);
        setProfile(res.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        message.error("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, urlUserId]); // Thêm urlUserId vào dependency để fetch lại khi URL thay đổi

  // Handle Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spin size="large" tip="Loading Profile..." />
      </div>
    );
  }

  const stats = [
    { label: "Warehouses", value: 12, icon: <Package className="w-5 h-5" /> },
    {
      label: "Optimized Paths",
      value: 450,
      icon: <Navigation className="w-5 h-5" />,
    },
    {
      label: "Total Bins",
      value: "2.4k",
      icon: <BarChart3 className="w-5 h-5" />,
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900 overflow-x-hidden">
      <div className="h-45 bg-slate-50 relative"></div>

      <section className="max-w-7xl mx-auto px-8 md:px-16 lg:px-24 -mt-32 relative z-10 pb-24">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* --- LEFT SIDEBAR: PROFILE CARD --- */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 p-10 border border-white">
              <div className="flex flex-col items-center text-center">
                <div className="relative group mb-8">
                  <div className="w-36 h-36 rounded-[2.5rem] bg-slate-50 p-1 border-2 border-[#39C6C6] overflow-hidden shadow-inner transition-transform group-hover:scale-105">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.fullName || "User"}`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                  {profile?.fullName || "N/A"}
                </h2>
                <p className="text-[#39C6C6] font-bold text-sm uppercase tracking-[0.2em] mb-2 italic">
                  {profile?.roleName || "User"}
                </p>
                <p className="text-slate-400 text-sm mb-6 font-medium">
                  {profile?.email}
                </p>

                <div className="flex items-center gap-2 text-slate-400 text-sm mb-10 bg-slate-50 px-5 py-2 rounded-full">
                  <Calendar className="w-4 h-4" />
                  <span>Company ID: {profile?.companyId}</span>
                </div>

                <div className="w-full space-y-4">
                  <button
                    onClick={() => navigate("edit")}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                  >
                    <Settings className="w-5 h-5" /> Account Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 hover:text-red-500 transition-all active:scale-95"
                  >
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#39C6C6] to-[#399EC6] p-8 rounded-[2rem] text-white flex items-center gap-5 shadow-xl shadow-[#39C6C6]/20">
              <ShieldCheck className="w-12 h-12 opacity-40 shrink-0" />
              <div>
                <p className="font-black text-lg tracking-tight">
                  {profile?.roleName}
                </p>
                <p className="text-xs opacity-80 uppercase font-bold tracking-widest">
                  Phone: {profile?.phone || "No phone added"}
                </p>
              </div>
            </div>
          </div>

          {/* --- RIGHT SIDE: ANALYTICS & RECENT --- */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white p-8 rounded-[2rem] border border-white shadow-sm transition-all hover:shadow-md"
                >
                  <div className="text-[#39C6C6] mb-6 bg-[#39C6C6]/10 w-12 h-12 rounded-2xl flex items-center justify-center">
                    {stat.icon}
                  </div>
                  <p className="text-4xl font-black text-slate-800 mb-1 tracking-tighter">
                    {stat.value}
                  </p>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[3rem] border border-white p-12 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#39C6C6]/5 rounded-full -mr-40 -mt-40 transition-transform group-hover:scale-110 duration-700"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-4 tracking-tight">
                  System Access
                </h3>
                <p className="text-slate-500 mb-10 max-w-md leading-relaxed">
                  Welcome back, <strong>{profile?.fullName}</strong>. You are
                  currently logged in with the role of{" "}
                  <strong>{profile?.roleName}</strong>.
                </p>
                <button
                  onClick={() => navigate("/explore")}
                  className="group bg-[#39C6C6] text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-[#39C6C6]/30 hover:shadow-xl transition-all active:scale-95"
                >
                  Explore Dashboard{" "}
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
