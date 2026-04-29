export const fmtDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    return dt.toLocaleDateString("vi-VN") + " " + dt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

export const isThisMonth = (d) => {
    const dt = new Date(d);
    const now = new Date();
    return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
};

export const isLastMonth = (d) => {
    const dt = new Date(d);
    const now = new Date();
    const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return dt.getMonth() === last.getMonth() && dt.getFullYear() === last.getFullYear();
};

export const dayLabel = (d) => {
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}`;
};

export const getLastSevenDays = () => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        days.push(dayLabel(d));
    }
    return days;
};

export const buildMonthlyData = (inbounds, outbounds) => {
    const timeline = getLastSevenDays();
    const m = {};

    // Initialize with 0s for the whole timeline
    timeline.forEach(k => {
        m[k] = { label: k, Inbound: 0, Outbound: 0, Trend: 0 };
    });

    (inbounds ?? []).forEach(r => {
        const k = dayLabel(r.createdAt);
        if (m[k]) m[k].Inbound++;
    });
    (outbounds ?? []).forEach(r => {
        const k = dayLabel(r.createdAt);
        if (m[k]) m[k].Outbound++;
    });

    // Calculate a simple trend line (sum of activity)
    Object.keys(m).forEach(k => {
        m[k].Trend = m[k].Inbound + m[k].Outbound;
    });

    return Object.values(m);
};

export const buildPieData = (arr, statuses) =>
    statuses.map(s => ({ name: s, value: arr.filter(r => r.status === s).length })).filter(d => d.value > 0);

export const buildAreaData = (arr) => {
    const timeline = getLastSevenDays();
    const m = {};

    // Initialize
    timeline.forEach(k => m[k] = 0);

    (arr ?? []).forEach(r => {
        const k = dayLabel(r.createdAt);
        if (m[k] !== undefined) m[k]++;
    });

    let cum = 0;
    return timeline.map(day => {
        cum += m[day];
        return { label: day, Tổng: cum };
    });
};

export const PIE_COLORS_IN = ["#fcd34d", "#6ee7b7", "#fda4af"]; // Amber 300, Emerald 300, Rose 300
export const PIE_COLORS_OUT = ["#fbbf24", "#6ee7b7", "#fda4af"]; // Amber 400, Emerald 300, Rose 300

