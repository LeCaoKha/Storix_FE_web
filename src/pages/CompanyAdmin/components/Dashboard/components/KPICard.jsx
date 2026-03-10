import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import TrendBadge from "./TrendBadge";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" } }),
};

const KPICard = ({ icon: Icon, label, value, sub, trend, to, i, themeColor = "cyan" }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = "/" + location.pathname.split("/").filter(Boolean)[0];

    const themeStyles = {
        cyan: { bg: "bg-cyan-50", icon: "text-cyan-600" },
        indigo: { bg: "bg-indigo-50", icon: "text-indigo-600" },
        emerald: { bg: "bg-emerald-50", icon: "text-emerald-600" },
        amber: { bg: "bg-amber-50", icon: "text-amber-600" },
    };
    const theme = themeStyles[themeColor] ?? themeStyles.cyan;

    return (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={i}
            onClick={() => to && navigate(`${basePath}/${to}`)}
            className={`group relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-100 shadow-sm ${to ? "cursor-pointer hover:border-[#39C6C6] hover:shadow-md transition-all duration-200" : ""}`}>

            <div className="flex items-start justify-between mb-4">
                <div className={`inline-flex p-2.5 rounded-xl ${theme.bg}`}>
                    <Icon size={18} className={theme.icon} />
                </div>
                {to && (
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#39C6C6] bg-cyan-50 px-2 py-1 rounded-lg">
                        Details <ArrowRight size={10} />
                    </span>
                )}
            </div>

            <div className="text-2xl font-black text-slate-800 tracking-tight">{(value ?? 0).toLocaleString()}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 uppercase leading-none">{label}</div>
            <div className="text-[11px] font-medium text-slate-400 mt-2 mb-3 h-4 truncate">{sub}</div>

            <div className="pt-3 border-t border-slate-50">
                {trend ? (
                    <TrendBadge current={trend.current} last={trend.last} />
                ) : (
                    <div className="h-4" />
                )}
            </div>
        </motion.div>
    );
};

export default KPICard;
