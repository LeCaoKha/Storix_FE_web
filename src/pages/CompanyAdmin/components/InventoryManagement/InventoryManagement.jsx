import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/axios"; // Bạn hãy kiểm tra lại số lượng ../ cho đúng với cấu trúc dự án
import { Table, Tag, Space, Input, Button, message, Typography } from "antd";
import { Search, RefreshCw, Warehouse, PackageSearch } from "lucide-react";

const { Title } = Typography;

const InventoryManagement = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  // --- FETCH WAREHOUSES LOGIC ---
  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem("companyId");
      if (!companyId) {
        message.warning("Company ID not found. Please log in again.");
        return;
      }
      const response = await api.get(
        `/company-warehouses/${companyId}/warehouses`,
      );
      setWarehouses(response.data);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to load warehouses";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // --- ANTD TABLE COLUMNS ---
  // Đã bỏ cột Action theo yêu cầu
  const columns = [
    {
      title: "#",
      key: "index",
      width: 80,
      render: (text, record, index) => (
        <span className="!text-slate-400 !font-mono">{index + 1}</span>
      ),
    },
    {
      title: "Warehouse Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <div className="!flex !items-center !gap-3">
          <div className="!p-2 !bg-[#39c6c6]/10 !rounded-xl !text-[#39c6c6]">
            <Warehouse size={18} />
          </div>
          <span className="!font-bold !text-slate-800 !text-base">{text}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={status === "Active" ? "cyan" : "red"}
          className="!rounded-full !px-4 !border-none !font-bold !uppercase !text-[10px]"
        >
          {status || "Unknown"}
        </Tag>
      ),
    },
  ];

  // Search Filter frontend
  const filteredData = warehouses.filter((w) =>
    w.name?.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div className="!bg-slate-50 !min-h-screen !font-sans !text-slate-900 !pb-12">
      <section className="md:!px-16 lg:!px-12 !pt-10 !pb-0">
        {/* PAGE HEADER */}
        <div className="!flex !flex-col md:!flex-row !justify-between !items-start md:!items-center !mb-10 !gap-8">
          <div>
            <Title
              level={2}
              className="!mb-0 !font-black !tracking-tight !flex !items-center !gap-3"
            >
              Inventory Management
              <PackageSearch className="!text-[#39c6c6]" size={28} />
            </Title>
          </div>

          <Space size="middle" className="!w-full md:!w-auto">
            <Button
              icon={
                <RefreshCw
                  size={16}
                  className={loading ? "!animate-spin" : ""}
                />
              }
              onClick={fetchWarehouses}
              className="!h-12 !px-6 !rounded-2xl !border-slate-200 !bg-white !font-bold !text-slate-600 hover:!text-[#39c6c6] hover:!border-[#39c6c6] !flex !items-center !shadow-sm"
            >
              Sync Data
            </Button>
          </Space>
        </div>

        {/* SEARCH FILTER */}
        <div>
          <Input
            placeholder="Search warehouse by name..."
            prefix={<Search size={20} className="!text-slate-400 !mr-3" />}
            className="!mb-5 !bg-white !h-12 !rounded-full !text-base !transition-all hover:!border-[#39C6C6] focus-within:!border-[#39C6C6]"
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* MAIN TABLE */}
        <div className="!bg-white !rounded-[1.5rem] !shadow-2xl !shadow-slate-200/50 !border !border-white !overflow-hidden !p-6">
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 8, className: "!px-6" }}
            onRow={(record) => ({
              onClick: () => {
                // Chuyển hướng đến route theo yêu cầu
                navigate(
                  `/company-admin/inventory-management/details/${record.id}`,
                );
              },
              className:
                "!cursor-pointer hover:!bg-slate-50 !transition-colors",
            })}
          />
        </div>
      </section>
    </div>
  );
};

export default InventoryManagement;
