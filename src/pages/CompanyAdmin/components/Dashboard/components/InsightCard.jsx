import React from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" } }),
};

const InsightCard = ({ insights }) => {
    if (!insights.length) return null;
    return (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100"><Lightbulb size={16} className="text-slate-400" /></div>
                <span className="font-bold text-slate-800 text-sm">System Insights</span>
                <span className="ml-auto px-2 py-0.5 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-tight">{insights.length} messages</span>
            </div>
            <ul className="space-y-2">
                {insights.map((ins, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] font-medium text-slate-500">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-[#39C6C6] flex-shrink-0" />
                        {ins}
                    </li>
                ))}
            </ul>
        </motion.div>
    );
};

export default InsightCard;
