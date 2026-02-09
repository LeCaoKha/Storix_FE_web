import React, { useState, useEffect } from "react";
import api from "../../../../api/axios";
import {
  Table,
  Tag,
  Space,
  Input,
  Button,
  message,
  Tooltip,
  Typography,
  Popconfirm,
  Select,
} from "antd";
import {
  Plus,
  Search,
  RefreshCw,
  Truck, // Thay icon Users bằng Truck cho Supplier
  UserX,
  UserCheck,
  Filter,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const navigate = useNavigate();

  // Lấy userId từ localStorage
  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem("userId")); // Hoặc localStorage.getItem("userId") tùy dự án
    return user?.id || user;
  };

  const fetchSuppliers = async () => {
    const userId = getUserId();
    if (!userId) {
      message.error("User ID not found in storage");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/Suppliers/get-all/${userId}`);
      setSuppliers(response.data);
    } catch (error) {
      message.error("Failed to fetch suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleToggleStatus = async (record) => {
    const newStatus = record.status === "Active" ? "Inactive" : "Active";
    try {
      // Giả định API cập nhật status cho Supplier tương tự User
      await api.put(`/Suppliers/${record.id}`, { status: newStatus });
      message.success(
        `Supplier ${newStatus === "Active" ? "activated" : "deactivated"} successfully`,
      );
      fetchSuppliers();
    } catch (error) {
      message.error(error.response?.data?.message || "Operation failed");
    }
  };

  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      render: (t, r, i) => (
        <span className="text-slate-400 font-mono">{i + 1}</span>
      ),
    },
    {
      title: "Supplier Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span className="font-bold text-slate-800 text-base uppercase tracking-tight">
          {text}
        </span>
      ),
    },
    {
      title: "Contact Person",
      dataIndex: "contactPerson",
      key: "contactPerson",
      render: (text) => (
        <Text className="font-medium text-slate-600">{text}</Text>
      ),
    },
    {
      title: "Email",
      key: "Email",
      render: (_, record) => (
        <div className="flex items-center text-base text-slate-500">
          {record.email}
        </div>
      ),
    },
    {
      title: "Phone",
      key: "Phone",
      render: (_, record) => (
        <div className="flex items-center text-base text-slate-500">
          {record.phone}
        </div>
      ),
    },
  ];

  const filteredData = suppliers.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      s.contactPerson?.toLowerCase().includes(searchText.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = filterStatus === "All" || s.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <section className="md:px-16 lg:px-12 pt-7 pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-8">
          <div>
            <Title level={2} className="!mb-0 !font-bold !tracking-tight">
              Supplier Management{" "}
              <Truck className="inline-block ml-2 text-[#39C6C6]" />
            </Title>
          </div>

          <Space size="middle">
            <Button
              icon={
                <RefreshCw
                  size={16}
                  className={loading ? "!animate-spin" : ""}
                />
              }
              onClick={fetchSuppliers}
              className="!h-12 !px-6 !rounded-2xl !border-slate-200 !font-bold !text-slate-600 hover:!text-[#39C6C6] hover:!border-[#39C6C6]"
            >
              Sync Data
            </Button>
            <Button
              type="primary"
              onClick={() => navigate("create")}
              icon={<Plus size={20} />}
              className="!h-12 !px-8 !bg-[#39C6C6] !border-none !rounded-2xl !font-bold hover:!bg-[#2eb1b1] !shadow-lg !shadow-[#39C6C6]/20 !flex !items-center"
            >
              Add Supplier
            </Button>
          </Space>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by name, contact or email..."
              prefix={<Search size={20} className="text-slate-300 mr-3" />}
              className="!h-12 !bg-white !rounded-full !text-base !transition-all !border-slate-300 hover:!border-[#39C6C6] focus-within:!border-[#39C6C6]"
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <Select
              defaultValue="All"
              className="!w-48 !h-12 !rounded-full !border !border-slate-300 hover:!border-[#39C6C6] focus-within:!border-[#39C6C6] overflow-hidden transition-all"
              onChange={(value) => setFilterStatus(value)}
              suffixIcon={<Filter size={16} className="text-slate-400" />}
            >
              <Option value="All">All Status</Option>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-[1rem] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden p-6">
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 8, className: "px-6" }}
            scroll={{ x: 1000 }}
            className="supplier-custom-table"
            onRow={(record) => ({
              onClick: (event) => {
                if (
                  event.target.closest("button") ||
                  event.target.closest(".ant-popover")
                )
                  return;
                navigate(`details/${record.id}`);
              },
            })}
          />
        </div>
      </section>

      <style jsx global>{`
        .supplier-custom-table .ant-table-tbody > tr {
          cursor: pointer;
          transition: all 0.2s;
        }
        .supplier-custom-table .ant-table-thead > tr > th {
          background: #f4f7fa !important;
          color: #4d4d4d !important;
          font-weight: 1000 !important;
          text-transform: uppercase !important;
          font-size: 12px !important;
          letter-spacing: 0.1em !important;
          border-bottom: 2px solid #f1f5f9 !important;
          padding: 20px !important;
        }
        .supplier-custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .ant-pagination-item-active {
          border-color: #39c6c6 !important;
        }
        .ant-pagination-item-active a {
          color: #39c6c6 !important;
        }
        .ant-select-selector {
          border-radius: 9999px !important;
          height: 48px !important;
          display: flex !important;
          align-items: center !important;
          border-color: #e2e8f0 !important;
          padding: 0 20px !important;
        }
      `}</style>
    </div>
  );
};

export default SupplierManagement;
