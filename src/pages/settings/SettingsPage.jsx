import React, { useState } from "react";
import { useSettings } from "../../context/SettingsContext";

/* ─── Toggle Switch ──────────────────────────────────────────── */
const Toggle = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200
      ${value ? "bg-[#39C6C6]" : "bg-gray-300"}`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200
        ${value ? "translate-x-5" : "translate-x-0"}`}
    />
  </button>
);

/* ─── Section Card ───────────────────────────────────────────── */
const Section = ({ icon, title, description, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
      <div className="w-8 h-8 rounded-lg bg-[#39C6C6]/15 flex items-center justify-center text-[#39C6C6]">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
    <div className="divide-y divide-gray-100">{children}</div>
  </div>
);

/* ─── Setting Row ────────────────────────────────────────────── */
const Row = ({ label, description, children }) => (
  <div className="flex items-center justify-between px-6 py-4 gap-6">
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

/* ─── Theme Picker ───────────────────────────────────────────── */
const ThemePicker = ({ value, onChange }) => {
  const options = [
    {
      key: "light",
      label: "Sáng",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" />
        </svg>
      ),
    },
    {
      key: "dark",
      label: "Tối",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
    },
    {
      key: "system",
      label: "Hệ thống",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 text-xs font-medium transition-all
            ${value === opt.key
              ? "border-[#39C6C6] text-[#39C6C6] bg-[#39C6C6]/8"
              : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
};

/* ─── Language Picker ────────────────────────────────────────── */
const LanguagePicker = ({ value, onChange }) => {
  const options = [
    { key: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
    { key: "en", label: "English", flag: "🇬🇧" },
  ];
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all
            ${value === opt.key
              ? "border-[#39C6C6] text-[#39C6C6] bg-[#39C6C6]/8"
              : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
        >
          <span className="text-lg">{opt.flag}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
};

/* ─── Select ─────────────────────────────────────────────────── */
const Select = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#39C6C6] bg-white text-gray-700 cursor-pointer"
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

/* ─── Toast ──────────────────────────────────────────────────── */
const SavedBadge = ({ show }) =>
  show ? (
    <span className="inline-flex items-center gap-1.5 text-xs text-green-600 font-medium animate-pulse">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      Đã lưu
    </span>
  ) : null;

/* ─── Main Page ──────────────────────────────────────────────── */
const SettingsPage = () => {
  const { settings, updateSettings } = useSettings();
  const [saved, setSaved] = useState(false);

  const notify = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (key, value) => {
    updateSettings({ [key]: value });
    notify();
  };

  const setNotif = (key, value) => {
    updateSettings({ notifications: { [key]: value } });
    notify();
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Cài đặt</h1>
        <SavedBadge show={saved} />
      </div>

      {/* ── Giao diện ── */}
      <Section
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        }
        title="Giao diện"
        description="Tùy chỉnh cách hiển thị ứng dụng"
      >
        <Row label="Chủ đề màu sắc" description="Chọn giao diện sáng, tối hoặc theo hệ thống">
          <ThemePicker value={settings.theme} onChange={(v) => set("theme", v)} />
        </Row>

        <Row label="Ngôn ngữ" description="Ngôn ngữ hiển thị giao diện">
          <LanguagePicker value={settings.language} onChange={(v) => set("language", v)} />
        </Row>

        <Row label="Sidebar thu gọn" description="Hiển thị sidebar dạng icon nhỏ">
          <Toggle
            value={settings.sidebarCompact}
            onChange={(v) => set("sidebarCompact", v)}
          />
        </Row>
      </Section>

      {/* ── Thông báo ── */}
      <Section
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        }
        title="Thông báo"
        description="Quản lý các cảnh báo và thông báo nhận được"
      >
        <Row label="Cảnh báo tồn kho thấp" description="Thông báo khi hàng dưới mức tối thiểu">
          <Toggle value={settings.notifications.lowStock} onChange={(v) => setNotif("lowStock", v)} />
        </Row>

        <Row label="Cảnh báo hàng sắp hết hạn" description="Thông báo khi hàng hóa gần hết hạn sử dụng">
          <Toggle value={settings.notifications.expiry} onChange={(v) => setNotif("expiry", v)} />
        </Row>

        <Row label="Cập nhật đơn hàng" description="Thông báo khi trạng thái đơn hàng thay đổi">
          <Toggle value={settings.notifications.orderUpdates} onChange={(v) => setNotif("orderUpdates", v)} />
        </Row>

        <Row label="Thông báo qua Email" description="Gửi các cảnh báo quan trọng qua email">
          <Toggle value={settings.notifications.email} onChange={(v) => setNotif("email", v)} />
        </Row>
      </Section>

      {/* ── Phiên đăng nhập ── */}
      <Section
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
        title="Bảo mật phiên"
        description="Cấu hình thời gian và bảo mật đăng nhập"
      >
        <Row label="Tự động đăng xuất" description="Đăng xuất khi không có hoạt động trong thời gian">
          <Select
            value={settings.autoLogout}
            onChange={(v) => set("autoLogout", v)}
            options={[
              { value: "15", label: "Sau 15 phút" },
              { value: "30", label: "Sau 30 phút" },
              { value: "60", label: "Sau 1 giờ" },
              { value: "never", label: "Không tự động" },
            ]}
          />
        </Row>
      </Section>

      {/* ── Dữ liệu ── */}
      <Section
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        }
        title="Dữ liệu & Bộ nhớ"
        description="Quản lý dữ liệu lưu trên trình duyệt"
      >
        <Row label="Xóa bộ nhớ cache" description="Xóa dữ liệu tạm thời để giải phóng bộ nhớ trình duyệt">
          <button
            onClick={() => {
              const keys = Object.keys(localStorage).filter(k => k.startsWith("storix_cache"));
              keys.forEach(k => localStorage.removeItem(k));
              notify();
            }}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Xóa cache
          </button>
        </Row>

        <Row label="Phiên bản" description="Phiên bản hiện tại của ứng dụng">
          <span className="text-sm text-gray-400 font-mono">v0.1.0</span>
        </Row>
      </Section>
    </div>
  );
};

export default SettingsPage;
