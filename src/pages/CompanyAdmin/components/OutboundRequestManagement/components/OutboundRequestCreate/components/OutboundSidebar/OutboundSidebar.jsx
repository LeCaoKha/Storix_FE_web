import React, { useState, useEffect } from "react";
import { Card, Input, Typography, message, Skeleton, Select } from "antd";
import { Warehouse, StickyNote, MapPin } from "lucide-react";
import api from "../../../../../../../../api/axios";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const OutboundSidebar = ({ onDataChange, outboundData }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSidebarData = async () => {
    const companyId = localStorage.getItem("companyId");
    // Lấy warehouseId từ localStorage để làm điều kiện lọc
    const localWarehouseId = localStorage.getItem("warehouseId");

    if (!companyId) return;

    setLoading(true);
    try {
      // Gọi API lấy danh sách kho hàng
      const res = await api.get(`/company-warehouses/${companyId}/warehouses`);

      // LỌC: Chỉ giữ lại warehouse có ID trùng với ID trong localStorage
      // Lưu ý: Ép kiểu String để so sánh an toàn vì localStorage luôn lưu dạng chuỗi
      let filteredWarehouses = res.data;
      if (localWarehouseId) {
        filteredWarehouses = res.data.filter(
          (w) => String(w.id) === String(localWarehouseId),
        );
      }

      setWarehouses(filteredWarehouses);

      // Mặc định chọn kho duy nhất vừa lọc được nếu state cha chưa có dữ liệu
      if (filteredWarehouses.length > 0 && !outboundData?.warehouseId) {
        if (onDataChange) onDataChange("warehouseId", filteredWarehouses[0].id);
      }
    } catch (error) {
      message.error("Failed to load warehouses");
      console.log("error: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSidebarData();
  }, []);

  const handleChange = (key, value) => {
    if (onDataChange) onDataChange(key, value);
  };

  return (
    <div className="space-y-6">
      {/* SECTION: ORIGIN WAREHOUSE */}
      <div>
        <Card className="!rounded-2xl !shadow-sm !border-slate-100">
          <Skeleton loading={loading} active paragraph={{ rows: 2 }}>
            <div>
              <Text className="block !font-bold !text-slate-700 mb-2 uppercase text-[10px] tracking-widest flex items-center gap-2">
                <Warehouse size={14} className="text-[#38c6c6]" /> Origin
                Warehouse
              </Text>
              <Select
                placeholder="Select shipping warehouse"
                className="w-full !h-12 custom-sidebar-select"
                value={outboundData?.warehouseId}
                onChange={(val) => handleChange("warehouseId", val)}
                suffixIcon={<Warehouse size={18} className="text-slate-400" />}
                // Thêm disabled nếu bạn không muốn người dùng bấm mở dropdown (vì đằng nào cũng chỉ có 1 lựa chọn)
                // disabled={warehouses.length <= 1}
              >
                {warehouses.map((w) => (
                  <Option key={w.id} value={w.id}>
                    {w.name}
                  </Option>
                ))}
              </Select>
            </div>
          </Skeleton>
        </Card>
      </div>

      {/* SECTION: DESTINATION ADDRESS (NEW) */}
      <div>
        <Card className="!rounded-2xl !shadow-sm !border-slate-100">
          <Text className="block !font-bold !text-slate-700 mb-3 uppercase text-[10px] tracking-widest flex items-center gap-2">
            <MapPin size={14} className="text-[#38c6c6]" /> Destination Address
          </Text>
          <Input
            size="large"
            placeholder="Enter shipping address or dispatch point..."
            value={outboundData?.destination}
            onChange={(e) => handleChange("destination", e.target.value)}
            className="!h-12 !rounded-xl !bg-slate-50 !border-none focus:!bg-white focus:!ring-2 focus:!ring-[#38c6c6]/20 transition-all"
          />
        </Card>
      </div>

      {/* SECTION: INTERNAL NOTES */}
      <div>
        <Card className="!rounded-2xl !shadow-sm !border-slate-100">
          <Text className="block !font-bold !text-slate-700 mb-3 uppercase text-[10px] tracking-widest flex items-center gap-2">
            <StickyNote size={14} className="text-[#38c6c6]" /> Internal Notes
          </Text>
          <TextArea
            rows={4}
            placeholder="Enter any shipment instructions or notes..."
            value={outboundData?.notes}
            className="!rounded-xl !bg-slate-50 !border-none !p-4 transition-all focus:!bg-white focus:!ring-2 focus:!ring-[#38c6c6]/20"
            onChange={(e) => handleChange("notes", e.target.value)}
          />
        </Card>
      </div>

      {/* Style CSS cho Select */}
      <style jsx global>{`
        .custom-sidebar-select .ant-select-selector {
          height: 48px !important;
          border-radius: 12px !important;
          background-color: #f8fafc !important; /* slate-50 */
          border: none !important;
          display: flex;
          align-items: center;
          transition: all 0.3s;
        }
        .custom-sidebar-select.ant-select-focused .ant-select-selector {
          background-color: white !important;
          box-shadow: 0 0 0 2px rgba(56, 198, 198, 0.2) !important;
        }
        .custom-sidebar-select .ant-select-selection-item {
          font-weight: 500;
          color: #334155;
        }
      `}</style>
    </div>
  );
};

export default OutboundSidebar;
