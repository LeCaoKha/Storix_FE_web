import React, { useState, useEffect } from "react";
import api from "../../../../api/axios";
import {
  Table,
  Tag,
  Space,
  Input,
  Button,
  Card,
  message,
  Tooltip,
  Typography,
  Popconfirm,
} from "antd";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  PackageSearch,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  console.log("product: ", products);

  // --- FETCH PRODUCTS LOGIC ---
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        message.warning("User ID not found. Please log in again.");
        return;
      }
      const response = await api.get(`/Products/get-all/${userId}`);

      setProducts(response.data);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to sync with warehouse server";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- DELETE PRODUCT LOGIC ---
  const handleDelete = async (productId) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        message.error("User session expired.");
        return;
      }

      // API: /Products/delete/{userId}/{productId}
      await api.delete(`/Products/delete/${userId}/${productId}`);

      message.success("Product deleted successfully");
      // Cập nhật lại danh sách sau khi xóa
      fetchProducts();
    } catch (error) {
      console.error("Delete error:", error);
      message.error(
        error.response?.data?.message || "Failed to delete product",
      );
    }
  };

  // --- ANTD TABLE COLUMNS ---
  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      fixed: "left",
      render: (text, record, index) => (
        <span className="text-slate-400 font-mono">{index + 1}</span>
      ),
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      fixed: "left",
      width: 80,
      render: (image, record) => (
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center">
          {image ? (
            <img
              src={image}
              alt={record.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Hiển thị ảnh mặc định nếu URL ảnh bị lỗi
                e.target.src =
                  "https://placehold.co/100x100/f8fafc/94a3b8?text=No+Image";
              }}
            />
          ) : (
            <span className="text-[10px] text-slate-400 font-medium">
              No Img
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      render: (text) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 text-base">{text}</span>
        </div>
      ),
    },
    {
      title: "SKU Code",
      dataIndex: "sku",
      key: "sku",
      render: (sku) => (
        <Tag className="bg-slate-100 border-none font-mono text-slate-600 px-3 py-1 rounded-lg">
          {sku}
        </Tag>
      ),
    },
    {
      title: "Type",
      dataIndex: "type", // Đã sửa: lấy nguyên object
      key: "type",
      render: (typeObj) => (
        <Tag
          color="cyan"
          className="rounded-full px-4 border-none font-bold uppercase text-[10px]"
        >
          {typeObj?.name || "Unclassified"}
        </Tag>
      ),
    },
    {
      title: "Category",
      dataIndex: "category", // Lấy nguyên object category
      key: "category",
      render: (cat) => (
        <span className="text-slate-500 font-medium">
          {/* Đã sửa: Truy xuất tên danh mục hoặc trả về mặc định */}
          {cat?.name || "Uncategorized"}
        </span>
      ),
    },
    {
      title: "Unit",
      key: "unit",
      render: (_, record) => (
        <div className="text-slate-600">
          <span>{record.unit}</span>
        </div>
      ),
    },
    {
      title: "Last Update",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <span className="text-slate-400 text-sm">
          {date ? new Date(date).toLocaleDateString("en-GB") : "N/A"}
        </span>
      ),
    },
    {
      title: "Operations",
      key: "actions",
      fixed: "right",
      width: 130,
      render: (_, record) => (
        <Space size="middle">
          {/* EDIT BUTTON */}
          <Tooltip title="Edit Product">
            <button
              onClick={() => navigate(`edit/${record.id}`)}
              className="p-2 hover:bg-[#39C6C6]/10 rounded-xl text-slate-400 hover:text-[#39C6C6] transition-all"
            >
              <Edit3 size={18} />
            </button>
          </Tooltip>

          {/* DELETE BUTTON WITH CONFIRMATION */}
          <Tooltip title="Remove">
            <Popconfirm
              title="Delete Product"
              description="Are you sure you want to delete this product?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes, Delete"
              cancelText="No"
              okButtonProps={{
                danger: true,
                style: { background: "#ff4d4f", borderColor: "#ff4d4f" },
              }}
            >
              <button className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-all">
                <Trash2 size={18} />
              </button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Frontend search filter
  const filteredData = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div className="bg-slate-50 font-sans text-slate-900">
      <section className="md:px-16 lg:px-12 pt-7 pb-0">
        {/* --- PAGE HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-8">
          <div>
            <Title level={2} className="!mb-0 !font-bold tracking-tight">
              Warehouse Stock{" "}
              <PackageSearch className="inline-block ml-2 text-[#39C6C6]" />
            </Title>
          </div>

          <Space size="middle" className="w-full md:w-auto">
            <Button
              icon={
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
              }
              onClick={fetchProducts}
              className="!h-12 !px-6 !rounded-2xl !border-slate-200 !font-bold !text-slate-600 !hover:!text-[#39C6C6] hover:!border-[#39C6C6]"
            >
              Sync Data
            </Button>
            <Button
              type="primary"
              onClick={() => navigate("create")}
              icon={<Plus size={20} />}
              className="!h-12 !px-8 !bg-[#39C6C6] !border-none !rounded-2xl !font-bold hover:!bg-[#2eb1b1] !shadow-lg !shadow-[#39C6C6]/20 !flex !items-center"
            >
              Add New SKU
            </Button>
          </Space>
        </div>

        {/* --- SEARCH FILTER --- */}
        <div>
          <Input
            placeholder="Quick search by product name or SKU code..."
            prefix={<Search size={20} className="text-slate-300 mr-3" />}
            className="!mb-5 !bg-white !h-12 !bg-slate-50 !rounded-full !text-base !transition-all
                hover:!border-[#39C6C6] 
                focus-within:!border-[#39C6C6] 
                focus-within:!shadow-[0_0_0_2px_rgba(57,198,198,0.2)]"
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* --- MAIN TABLE --- */}
        <div className="bg-white rounded-[1rem] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden p-6">
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 4,
              className: "px-6",
            }}
            scroll={{ x: 1100 }}
            className="storix-table"
            onRow={(record) => ({
              onClick: (event) => {
                // Kiểm tra nếu click vào button hoặc các phần tử trong Popconfirm
                // thì không thực hiện chuyển hướng trang details
                if (
                  event.target.closest("button") ||
                  event.target.closest(".ant-popover")
                ) {
                  return;
                }
                navigate(`details/${record.id}`);
              },
            })}
          />
        </div>
      </section>
    </div>
  );
};

export default ProductManagement;
