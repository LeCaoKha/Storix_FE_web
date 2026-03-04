import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const TrendBadge = ({ current, last }) => {
    if (last === 0 && current === 0) return <span className="text-xs text-slate-400 font-semibold">No change</span>;
    if (last === 0) return (
        <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
            <TrendingUp size={12} /> +{current} this month
        </span>
    );
    const diff = current - last;
    const pct = Math.round((diff / last) * 100);
    if (diff > 0) return (
        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
            <TrendingUp size={12} /> +{diff} this month ({pct}%)
        </span>
    );
    if (diff < 0) return (
        <span className="flex items-center gap-1 text-xs font-bold text-red-300">
            <TrendingDown size={12} /> {diff} this month ({pct}%)
        </span>
    );
    return <span className="flex items-center gap-1 text-xs font-bold text-white/60"><Minus size={12} /> No change</span>;
};

export default TrendBadge;
