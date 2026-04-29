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
  Download, // ===== ADDED: Icon Download =====
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// ===== ADDED CODE START =====
import * as XLSX from "xlsx"; // Import thư viện xlsx
// ===== ADDED CODE END =====

const { Title } = Typography;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  // Lấy roleId từ localStorage để phân quyền hiển thị nút
  const roleId = Number(localStorage.getItem("roleId"));

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

  // Frontend search filter
  const filteredData = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchText.toLowerCase()),
  );

  // ===== ADDED CODE START =====
  // --- EXPORT EXCEL LOGIC ---
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      message.warning("No products to export!");
      return;
    }

    try {
      // 1. Chuẩn bị dữ liệu để xuất (Mapping lại các trường cho đẹp)
      const exportData = filteredData.map((item, index) => ({
        "No.": index + 1,
        "Product Name": item.name,
        "SKU Code": item.sku,
        Type: item.type?.name || "Unclassified",
        Category: item.category?.name || "Uncategorized",
        Unit: item.unit,
        "Last Update": item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("en-GB")
          : "N/A",
      }));

      // 2. Tạo WorkSheet và WorkBook
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

      // 3. Tự động điều chỉnh độ rộng cột (Auto-fit width) cho dễ nhìn
      const wscols = [
        { wch: 5 }, // No.
        { wch: 40 }, // Product Name
        { wch: 20 }, // SKU
        { wch: 15 }, // Type
        { wch: 20 }, // Category
        { wch: 10 }, // Unit
        { wch: 15 }, // Last Update
      ];
      worksheet["!cols"] = wscols;

      // 4. Lưu file và tải xuống
      const fileName = `Products_List_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      message.success("Exported to Excel successfully!");
    } catch (error) {
      console.error("Export Error:", error);
      message.error("Failed to export Excel file");
    }
  };
  // ===== ADDED CODE END =====

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
      dataIndex: "type",
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
      dataIndex: "category",
      key: "category",
      render: (cat) => (
        <span className="text-slate-500 font-medium">
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
            {/* ===== ADDED CODE START: NÚT EXPORT EXCEL ===== */}
            <Button
              icon={<Download size={16} />}
              onClick={handleExportExcel}
              className="!h-12 !px-6 !rounded-2xl !border-slate-200 !font-bold !text-slate-600 !hover:!text-[#39C6C6] hover:!border-[#39C6C6] !flex !items-center"
            >
              Export Excel
            </Button>
            {/* ===== ADDED CODE END ===== */}

            <Button
              icon={
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
              }
              onClick={fetchProducts}
              className="!h-12 !px-6 !rounded-2xl !border-slate-200 !font-bold !text-slate-600 !hover:!text-[#39C6C6] hover:!border-[#39C6C6] !flex !items-center"
            >
              Sync Data
            </Button>

            {/* CHỈ HIỂN THỊ NÚT ADD NEW SKU NẾU ROLE ID LÀ 2 */}
            {roleId === 2 && (
              <Button
                type="primary"
                onClick={() => navigate("create")}
                icon={<Plus size={20} />}
                className="!h-12 !px-8 !bg-[#39C6C6] !border-none !rounded-2xl !font-bold hover:!bg-[#2eb1b1] !shadow-lg !shadow-[#39C6C6]/20 !flex !items-center"
              >
                Add New SKU
              </Button>
            )}
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
