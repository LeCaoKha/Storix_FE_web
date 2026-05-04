import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../../api/axios";
import { Skeleton, Tooltip, message, Spin } from "antd";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, Legend, AreaChart, Area, PieChart, Pie, Cell,
  ComposedChart, Line, Label,
} from "recharts";
import {
  Users, Package, ArrowDownCircle, ArrowUpCircle, RefreshCw,
  AlertTriangle, ChevronRight, CheckCircle, UserPlus, ShoppingCart,
  Truck, ArrowRight, Bell, Zap, Box,
} from "lucide-react";

// modular components
import StatusBadge from "./components/StatusBadge";
import KPICard from "./components/KPICard";
import {
  fmtDate, isThisMonth, isLastMonth,
  buildMonthlyData, buildPieData, buildAreaData,
  PIE_COLORS_IN, PIE_COLORS_OUT,
} from "./components/DashboardUtils";

// ─── animation ─────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" } }),
};

// ─── main ──────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Derive /company-admin or /manager from current URL
  const basePath = "/" + location.pathname.split("/").filter(Boolean)[0];
  const go = (path) => navigate(`${basePath}/${path}`);

  const fullName = localStorage.getItem("fullName") ?? "Admin";

  // State for session info (to ensure we have the latest from localStorage)
  const [session] = useState({
    userId: localStorage.getItem("userId"),
    companyId: localStorage.getItem("companyId"),
    fullName: localStorage.getItem("fullName")
  });

  // State for dashboard data
  const [accounts, setAccounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [inboundRequests, setInboundRequests] = useState([]);
  const [outboundRequests, setOutboundRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async (isRefresh = false) => {
    // Re-verify session info
    const uId = session.userId || localStorage.getItem("userId");
    const cId = session.companyId || localStorage.getItem("companyId");

    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      // Fetch main dashboard data
      const res = await Promise.allSettled([
        api.get("/Users"),
        uId ? api.get(`/Products/get-all/${uId}`) : Promise.reject("Missing User ID"),
        cId ? api.get(`/InventoryInbound/requests/${cId}`) : Promise.reject("Missing Company ID"),
        cId ? api.get(`/InventoryOutbound/requests/${cId}`) : Promise.reject("Missing Company ID"),
      ]);

      if (res[0].status === "fulfilled") setAccounts(res[0].value.data ?? []);
      if (res[1].status === "fulfilled") setProducts(res[1].value.data ?? []);
      if (res[2].status === "fulfilled") setInboundRequests(res[2].value.data ?? []);
      if (res[3].status === "fulfilled") setOutboundRequests(res[3].value.data ?? []);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      message.error("Could not sync dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]); // Only once on mount or when session changes internally

  // ── derived ─────────────────────────────────────────────────────────────
  const pendingInbound = inboundRequests.filter(r => r.status === "Pending").length;
  const pendingOutbound = outboundRequests.filter(r => r.status === "Pending").length;
  const lowStockProducts = [...products].filter(p => (p.currentStock ?? p.stockQuantity ?? 0) <= 10).slice(0, 6);

  // trend: this month vs last month
  const inThisMonth = inboundRequests.filter(r => isThisMonth(r.createdAt)).length;
  const inLastMonth = inboundRequests.filter(r => isLastMonth(r.createdAt)).length;
  const outThisMonth = outboundRequests.filter(r => isThisMonth(r.createdAt)).length;
  const outLastMonth = outboundRequests.filter(r => isLastMonth(r.createdAt)).length;
  const accThisMonth = accounts.filter(a => isThisMonth(a.createdAt)).length;
  const accLastMonth = accounts.filter(a => isLastMonth(a.createdAt)).length;
  const prdThisMonth = products.filter(p => isThisMonth(p.createdAt)).length;
  const prdLastMonth = products.filter(p => isLastMonth(p.createdAt)).length;


  // KPI config
  const kpis = [
    {
      themeColor: "indigo", icon: Users,
      label: "Total Accounts", value: accounts.length,
      sub: `${accounts.filter(a => a.status === "Active").length} active members`,
      trend: { current: accThisMonth, last: accLastMonth }, to: "account-management"
    },
    {
      themeColor: "cyan", icon: Box,
      label: "Products", value: products.length,
      sub: `${products.filter(p => (p.currentStock ?? p.stockQuantity ?? 0) <= 0).length} items out of stock`,
      trend: { current: prdThisMonth, last: prdLastMonth }, to: "product-management"
    },
    {
      themeColor: "emerald", icon: ArrowDownCircle,
      label: "Inbound Requests", value: inboundRequests.length,
      sub: `${pendingInbound} requests pending approval`,
      trend: { current: inThisMonth, last: inLastMonth }, to: "inbound-request-management"
    },
    {
      themeColor: "amber", icon: ArrowUpCircle,
      label: "Outbound Requests", value: outboundRequests.length,
      sub: `${pendingOutbound} requests pending approval`,
      trend: { current: outThisMonth, last: outLastMonth }, to: "outbound-management"
    },
  ];

  const recentInbound = [...inboundRequests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const recentOutbound = [...outboundRequests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

  const monthlyBarData = buildMonthlyData(inboundRequests, outboundRequests);
  const inboundPieData = buildPieData(inboundRequests, ["Pending", "Approved", "Rejected"]);
  const outboundPieData = buildPieData(outboundRequests, ["Pending", "Approved", "Rejected"]);
  const cumulativeArea = buildAreaData([...inboundRequests, ...outboundRequests]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const displayFullName = session.fullName || fullName;

  // ── loading state ────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center bg-transparent">
      <Spin size="large" tip="Loading Warehouse Dashboard..." />
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900">
      <div className="md:px-16 lg:px-12 pt-7 pb-12 space-y-6">

        {/* ─── LEVEL 0: HEADER ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{today}</p>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
              {greeting},{" "}
              <span className="text-[#39C6C6]">{displayFullName}</span>
            </h1>
            <p className="text-slate-400 mt-1 text-sm font-medium">Overview of your warehouse operations</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => go("inbound-request-management/create")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#39C6C6] text-white font-bold shadow-lg shadow-[#39C6C6]/20 hover:bg-[#2eb1b1] hover:-translate-y-0.5 transition-all text-sm">
              <ArrowDownCircle size={16} /> New Inbound
            </button>
            <button onClick={() => go("outbound-management/create")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold shadow-sm hover:border-[#39C6C6] hover:text-[#39C6C6] hover:-translate-y-0.5 transition-all text-sm">
              <ArrowUpCircle size={16} /> New Outbound
            </button>
            <button onClick={() => fetchAll(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white shadow-sm font-semibold text-slate-400 hover:text-slate-600 transition-all text-sm">
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* ─── LEVEL 1: CRITICAL ALERTS ────────────────────────────────── */}
        {(pendingInbound > 0 || pendingOutbound > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingInbound > 0 && (
              <button onClick={() => go("inbound-request-management")}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-rose-100 shadow-sm hover:shadow-md hover:border-rose-200 transition-all text-left w-full group">
                <div className="p-3 bg-rose-50 rounded-xl text-rose-500 group-hover:scale-110 transition-transform"><Bell size={20} /></div>
                <div className="flex-1">
                  <p className="font-extrabold text-slate-800 text-base">{pendingInbound} Inbound Request{pendingInbound > 1 ? "s" : ""} Pending</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Approval Required</p>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            {pendingOutbound > 0 && (
              <button onClick={() => go("outbound-management")}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-amber-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all text-left w-full group">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-500 group-hover:scale-110 transition-transform"><Zap size={20} /></div>
                <div className="flex-1">
                  <p className="font-extrabold text-slate-800 text-base">{pendingOutbound} Outbound Request{pendingOutbound > 1 ? "s" : ""} Pending</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Approval Required</p>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        )}

        {/* ─── LEVEL 2: KPI SUMMARY ───────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {kpis.map((k, i) => <KPICard key={i} {...k} i={i} />)}
        </div>


        {/* ─── LEVEL 4: TRENDS (charts) ────────────────────────────────── */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Analytics</p>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-bold text-slate-800 text-sm">Daily Activity (Last 7 Days)</span>
              </div>
              {monthlyBarData.length === 0
                ? <div className="h-52 flex items-center justify-center text-slate-400 text-sm">No activity data yet</div>
                : <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={monthlyBarData} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barInbound" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#39C6C6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#39C6C6" stopOpacity={0.7} />
                      </linearGradient>
                      <linearGradient id="barOutbound" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <ReTooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 10px 30px rgba(0,0,0,.08)", fontSize: 12, padding: "12px" }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
                    <Bar dataKey="Inbound" fill="url(#barInbound)" stackId="a" radius={[4, 4, 0, 0]} barSize={16} />
                    <Bar dataKey="Outbound" fill="url(#barOutbound)" stackId="a" radius={[4, 4, 0, 0]} barSize={16} />
                    <Line type="monotone" dataKey="Trend" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: "#8b5cf6" }} />
                  </ComposedChart>
                </ResponsiveContainer>
              }
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-bold text-slate-800 text-sm">Cumulative Weekly Requests</span>
              </div>
              {cumulativeArea.length === 0
                ? <div className="h-52 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
                : <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={cumulativeArea} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#39C6C6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#39C6C6" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <ReTooltip
                      contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 10px 30px rgba(0,0,0,.08)", fontSize: 12, padding: "12px" }}
                    />
                    <Area type="monotone" dataKey="Tổng" stroke="#39C6C6" strokeWidth={3} fill="url(#areaGrad)" dot={{ r: 4, fill: "#fff", stroke: "#39C6C6", strokeWidth: 2 }} activeDot={{ r: 6, shadow: "0 0 10px rgba(57,198,198,0.5)" }} />
                  </AreaChart>
                </ResponsiveContainer>
              }
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {[
              { title: "Inbound Request Status", data: inboundPieData, colors: PIE_COLORS_IN, icon: <ArrowDownCircle size={15} className="text-[#39C6C6]" /> },
              { title: "Outbound Request Status", data: outboundPieData, colors: PIE_COLORS_OUT, icon: <ArrowUpCircle size={15} className="text-orange-500" /> },
            ].map((chart, ci) => (
              <div key={ci} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  {chart.icon}
                  <span className="font-bold text-slate-800 text-sm">{chart.title}</span>
                </div>
                {chart.data.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center gap-2 text-slate-400 text-sm">
                    <CheckCircle size={26} className="text-emerald-400 opacity-20" /> No data yet
                  </div>
                ) : (
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width="55%" height={160}>
                      <PieChart>
                        <Pie data={chart.data} cx="50%" cy="50%" innerRadius={50} outerRadius={68} paddingAngle={2} cornerRadius={6} dataKey="value">
                          {chart.data.map((_, i) => <Cell key={i} fill={chart.colors[i % chart.colors.length]} stroke="none" />)}
                          <Label
                            value={chart.data.reduce((acc, curr) => acc + curr.value, 0)}
                            position="center"
                            className="font-black text-xl fill-slate-800"
                          />
                        </Pie>
                        <ReTooltip contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 10px 30px rgba(0,0,0,.08)", fontSize: 12, padding: "12px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-3">
                      {chart.data.map((d, i) => (
                        <div key={d.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chart.colors[i % chart.colors.length] }} />
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{d.name}</span>
                          </div>
                          <span className="text-xs font-black text-slate-800">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── LEVEL 5: ACTIONABLE LISTS ───────────────────────────────── */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Activity & Alerts</p>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {[
              {
                title: "Recent Inbound", icon: <ArrowDownCircle size={15} className="text-[#39C6C6]" />, iconBg: "bg-cyan-50",
                items: recentInbound, empty: "No inbound requests",
                onClick: (r) => go(`inbound-request-management/details/${r.id}`),
                navLabel: "View all", navTo: "inbound-request-management"
              },
              {
                title: "Recent Outbound", icon: <ArrowUpCircle size={15} className="text-amber-500" />, iconBg: "bg-amber-50",
                items: recentOutbound, empty: "No outbound requests",
                onClick: () => go("outbound-management"),
                navLabel: "View all", navTo: "outbound-management"
              },
            ].map((section, si) => (
              <div key={si} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${section.iconBg}`}>{section.icon}</div>
                    <span className="font-bold text-slate-800 text-sm">{section.title}</span>
                  </div>
                  <button onClick={() => go(section.navTo)}
                    className="text-xs text-[#39C6C6] font-semibold hover:underline flex items-center gap-1">
                    {section.navLabel} <ChevronRight size={12} />
                  </button>
                </div>
                {section.items.length === 0 ? (
                  <div className="px-5 py-10 text-center text-slate-400 text-sm">{section.empty}</div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {section.items.map((r, i) => (
                      <button key={r.id ?? i} onClick={() => section.onClick(r)}
                        className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-all text-left">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate">{r.code ?? `#${r.id}`}</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {r.warehouse?.name ?? "Unknown"} · {fmtDate(r.createdAt)}
                          </p>
                        </div>
                        <div className="ml-3 flex-shrink-0"><StatusBadge status={r.status} /></div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-red-50"><AlertTriangle size={15} className="text-red-500" /></div>
                  <span className="font-bold text-slate-800 text-sm">Low Stock</span>
                  {lowStockProducts.length > 0 &&
                    <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-black">{lowStockProducts.length}</span>
                  }
                </div>
                <button onClick={() => go("product-management")}
                  className="text-xs text-[#39C6C6] font-semibold hover:underline flex items-center gap-1">
                  View all <ChevronRight size={12} />
                </button>
              </div>
              {lowStockProducts.length === 0 ? (
                <div className="px-5 py-10 flex flex-col items-center gap-2 text-slate-400 text-sm">
                  <CheckCircle size={26} className="text-emerald-400" />All products sufficient
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {lowStockProducts.map((p, i) => {
                    const stock = p.currentStock ?? p.stockQuantity ?? 0;
                    return (
                      <button key={p.id ?? i} onClick={() => go(`product-management/details/${p.id}`)}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-all text-left">
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt={p.name} className="w-9 h-9 rounded-xl object-cover border border-slate-100 flex-shrink-0" />
                          : <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <Package size={15} className="text-slate-400" />
                          </div>
                        }
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate">{p.name}</p>
                          <p className="text-xs text-slate-400 truncate">{p.sku ?? "No SKU"}</p>
                        </div>
                        <span className={`font-black text-sm flex-shrink-0 ${stock === 0 ? "text-red-500" : "text-orange-500"}`}>{stock}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── LEVEL 6: SECONDARY — Team Overview ─────────────────────── */}
        {accounts.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Team</p>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-indigo-500" />
                  <span className="font-bold text-slate-800 text-sm">Team Overview</span>
                </div>
                <button onClick={() => go("account-management")}
                  className="text-xs text-[#39C6C6] font-semibold hover:underline flex items-center gap-1">
                  Manage All <ChevronRight size={12} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {accounts.slice(0, 16).map((acc, i) => {
                  const roleColors = { 2: "bg-violet-100 text-violet-700", 3: "bg-blue-100 text-blue-700", 4: "bg-emerald-100 text-emerald-700" };
                  const roleNames = { 2: "Admin", 3: "Manager", 4: "Staff" };
                  const color = roleColors[acc.roleId] ?? "bg-slate-100 text-slate-600";
                  const initials = (acc.fullName ?? "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                  const isActive = acc.status === "Active";
                  return (
                    <Tooltip key={acc.id ?? i} title={`${acc.fullName} · ${roleNames[acc.roleId] ?? "Unknown"} · ${acc.status}`}>
                      <div className={`relative flex items-center justify-center w-10 h-10 rounded-full font-black text-sm ${color} cursor-default select-none border-2 ${isActive ? "border-white shadow-md" : "border-slate-200 opacity-50"}`}>
                        {initials}
                        {isActive && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />}
                      </div>
                    </Tooltip>
                  );
                })}
                {accounts.length > 16 && (
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-500 font-bold text-xs">
                    +{accounts.length - 16}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Managers", count: accounts.filter(a => a.roleId === 3).length, color: "text-blue-600 bg-blue-50" },
                  { label: "Staff", count: accounts.filter(a => a.roleId === 4).length, color: "text-emerald-600 bg-emerald-50" },
                  { label: "Active", count: accounts.filter(a => a.status === "Active").length, color: "text-teal-600 bg-teal-50" },
                  { label: "Inactive", count: accounts.filter(a => a.status !== "Active").length, color: "text-red-500 bg-red-50" },
                ].map(chip => (
                  <span key={chip.label} className={`px-3 py-1 rounded-full text-xs font-bold ${chip.color}`}>
                    {chip.label}: {chip.count}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
