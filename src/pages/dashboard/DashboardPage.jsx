import React from "react";
import useAuth from "../../hooks/useAuth";

const sampleLowStock = [
  { name: "Pallet nhựa 1200x1000", warehouse: "Kho A", qty: 6, min: 20 },
  { name: "Xe nâng tay 2 tấn", warehouse: "Kho B", qty: 2, min: 5 },
  { name: "Kệ sắt tầng 5", warehouse: "Kho A", qty: 3, min: 10 },
  { name: "Thùng carton loại 1", warehouse: "Kho C", qty: 8, min: 50 },
  { name: "Băng dán thùng hàng", warehouse: "Kho B", qty: 5, min: 30 },
];

const sampleOverStock = [
  { name: "Bao bì nhựa PE", warehouse: "Kho A", qty: 1240, max: 500 },
  { name: "Nhãn mã vạch 50x30", warehouse: "Kho B", qty: 8500, max: 2000 },
  { name: "Hộp đóng gói 30x20", warehouse: "Kho A", qty: 930, max: 300 },
  { name: "Dây đai nhựa 12mm", warehouse: "Kho C", qty: 620, max: 200 },
  { name: "Túi khí chèn hàng", warehouse: "Kho B", qty: 3200, max: 1000 },
];

const sampleExpiringSoon = [
  { name: "Pin AA Alkaline Bulk", expiry: "28/02/2026", lot: "L00041", qty: 120 },
  { name: "Sơn chống rỉ 3M", expiry: "05/03/2026", lot: "L00038", qty: 24 },
  { name: "Keo dán công nghiệp", expiry: "10/03/2026", lot: "L00029", qty: 36 },
  { name: "Mỡ bôi trơn Castrol", expiry: "15/03/2026", lot: "L00033", qty: 18 },
];

const sampleExpired = [
  { name: "Dầu nhớt 15W-40", expiry: "10/01/2026", lot: "L00014", qty: 6 },
  { name: "Hóa chất tẩy rửa CN", expiry: "20/01/2026", lot: "L00017", qty: 8 },
  { name: "Bình xịt chống ẩm", expiry: "01/02/2026", lot: "L00009", qty: 3 },
];

const TableCard = ({ title, children, badgeCount, badgeColor = "bg-red-100 text-red-600" }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
      <div className="flex items-center gap-2.5">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        {badgeCount !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
            {badgeCount}
          </span>
        )}
      </div>
      <button className="text-gray-400 hover:text-[#39C6C6] transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
    <div className="overflow-x-auto">{children}</div>
    <div className="px-5 py-2.5 border-t border-gray-100">
      <p className="text-xs text-gray-400">
        Số liệu tính đến:{" "}
        <span className="text-[#39C6C6] cursor-pointer hover:underline">Tải lại</span>
      </p>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const name = user?.adminFullName || user?.name || "bạn";

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Tổng quan</h1>

      <div className="relative bg-gradient-to-r from-[#1B2555] to-[#2a3a7c] rounded-xl px-7 py-5 overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-64 opacity-20">
          <svg viewBox="0 0 200 200" className="h-full w-full" fill="none">
            <circle cx="150" cy="50" r="80" fill="#39C6C6" />
            <circle cx="180" cy="150" r="60" fill="#75F0A8" />
          </svg>
        </div>
        <div className="relative z-10 max-w-xl">
          <p className="text-white font-semibold text-base mb-1">
            Chào {name}, chào mừng bạn đến với Storix!
          </p>
          <p className="text-white/70 text-sm mb-4">
            Quản lý kho thông minh – theo dõi tồn kho và tối ưu hóa hoạt động kho theo thời gian thực.
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#39C6C6] to-[#75F0A8] text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity">
            Bắt đầu sử dụng
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <TableCard title="Tồn kho dưới mức tối thiểu" badgeCount={sampleLowStock.length} badgeColor="bg-orange-100 text-orange-600">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên hàng hóa</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kho</th>
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">SL tồn</th>
                <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tối thiểu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sampleLowStock.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/70">
                  <td className="px-5 py-2.5 text-gray-800 font-medium">{row.name}</td>
                  <td className="px-3 py-2.5 text-gray-500">{row.warehouse}</td>
                  <td className="px-3 py-2.5 text-right text-orange-600 font-semibold">{row.qty}</td>
                  <td className="px-5 py-2.5 text-right text-gray-500">{row.min}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        <TableCard title="Tồn kho vượt mức tối đa" badgeCount={sampleOverStock.length} badgeColor="bg-blue-100 text-blue-600">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên hàng hóa</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kho</th>
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">SL tồn</th>
                <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tối đa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sampleOverStock.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/70">
                  <td className="px-5 py-2.5 text-gray-800 font-medium">{row.name}</td>
                  <td className="px-3 py-2.5 text-gray-500">{row.warehouse}</td>
                  <td className="px-3 py-2.5 text-right text-blue-600 font-semibold">{row.qty}</td>
                  <td className="px-5 py-2.5 text-right text-gray-500">{row.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        <TableCard title="Hàng hóa sắp hết hạn trong 30 ngày" badgeCount={sampleExpiringSoon.length} badgeColor="bg-yellow-100 text-yellow-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên hàng hóa</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Hạn SD</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Số lô</th>
                <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">SL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sampleExpiringSoon.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/70">
                  <td className="px-5 py-2.5 text-gray-800 font-medium">{row.name}</td>
                  <td className="px-3 py-2.5 text-yellow-600 font-medium">{row.expiry}</td>
                  <td className="px-3 py-2.5 text-gray-500">{row.lot}</td>
                  <td className="px-5 py-2.5 text-right text-gray-700 font-semibold">{row.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        <TableCard title="Hàng hóa quá hạn sử dụng" badgeCount={sampleExpired.length} badgeColor="bg-red-100 text-red-600">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tên hàng hóa</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Hạn SD</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Số lô</th>
                <th className="text-right px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">SL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sampleExpired.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/70">
                  <td className="px-5 py-2.5 text-gray-800 font-medium">{row.name}</td>
                  <td className="px-3 py-2.5 text-red-500 font-medium">{row.expiry}</td>
                  <td className="px-3 py-2.5 text-gray-500">{row.lot}</td>
                  <td className="px-5 py-2.5 text-right text-gray-700 font-semibold">{row.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      </div>
    </div>
  );
};

export default DashboardPage;
