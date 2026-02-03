import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Shield,
  Building2,
  Calendar,
  Edit3,
  User as UserIcon,
  Fingerprint,
} from "lucide-react";
import { Tag, Button, Spin, message, Card } from "antd";
import api from "../../../../../../api/axios";

const AccountDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FETCH USER DETAILS ---
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/Users/get-user-profile/${id}`);
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
        message.error("Could not load user profile");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUserDetails();
  }, [id]);

  // --- ROLE STYLE LOGIC ---
  const getRoleStyle = (roleName) => {
    let displayName = roleName === "Company Administrator" ? "Admin" : roleName;
    displayName =
      displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase();

    let color = "default";
    if (displayName === "Admin") color = "purple";
    if (displayName === "Manager") color = "blue";
    if (displayName === "Staff") color = "green";

    return { displayName, color };
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Spin size="large" tip="Loading profile..." />
      </div>
    );
  }

  if (!user) return <div className="p-10 text-center">User not found</div>;

  const roleInfo = getRoleStyle(user.roleName);

  return (
    <div className="bg-slate-50 font-sans text-slate-900 pb-20">
      {/* --- TOP BANNER (Hero) --- */}
      <div className=" h-40 relative">
        <button
          onClick={() => navigate(-1)}
          className="text-black absolute top-8 left-8 flex items-center gap-2 font-bold transition-all group"
        >
          <ArrowLeft
            size={20}
            className="!text-black group-hover:-translate-x-1 transition-transform"
          />
          BACK TO LIST
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-20">
        <div className="flex flex-col gap-8">
          {/* --- MAIN PROFILE CARD --- */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden p-8 md:p-12 relative">
            {/* Edit Button Positioned at Top Right */}

            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              {/* Avatar Section */}
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-slate-50 p-1 border-2 border-[#39c6c6] overflow-hidden shadow-inner">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Basic Info Header */}
              <div className="text-center md:text-left pt-4">
                <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                  <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                    {user.fullName}
                  </h1>
                  <Tag
                    color={roleInfo.color}
                    className="!rounded-full !px-4 !border-none !font-bold !text-[11px] !m-0"
                  >
                    {roleInfo.displayName}
                  </Tag>
                </div>
                <p className="text-slate-400 font-medium text-lg mb-6">
                  {user.email}
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-slate-500 text-sm font-semibold">
                    <Fingerprint size={16} className="text-[#39c6c6]" />
                    ID: {user.id}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-slate-500 text-sm font-semibold">
                    <Building2 size={16} className="text-[#39c6c6]" />
                    Company: {user.companyId}
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-10 border-slate-100" />

            {/* --- DETAILED INFORMATION GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Email Contact
                  </p>
                  <p className="text-slate-700 font-bold">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Phone Number
                  </p>
                  <p className="text-slate-700 font-bold">
                    {user.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                  <Shield size={24} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    System Role
                  </p>
                  <p className="text-slate-700 font-bold">{user.roleName}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Member Since
                  </p>
                  <p className="text-slate-700 font-bold">February 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
