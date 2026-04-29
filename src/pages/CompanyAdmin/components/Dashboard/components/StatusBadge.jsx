import React from "react";

const statusStyles = {
    Pending: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", dot: "bg-amber-400" },
    Approved: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", dot: "bg-emerald-400" },
    Rejected: { bg: "bg-red-50", text: "text-red-500", border: "border-red-200", dot: "bg-red-400" },
    Processing: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", dot: "bg-blue-400" },
    Completed: { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-200", dot: "bg-teal-400" },
};

const StatusBadge = ({ status }) => {
    const s = statusStyles[status] ?? { bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-200", dot: "bg-slate-400" };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${s.bg} ${s.text} ${s.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{status}
        </span>
    );
};

export default StatusBadge;
