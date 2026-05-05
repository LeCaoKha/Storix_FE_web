import React from "react";
import { Card, Table, Typography } from "antd";
import { Package, ImageIcon } from "lucide-react"; // Thêm ImageIcon để làm fallback nếu không có ảnh

const { Text } = Typography;

const DetailsProductList = ({ items = [] }) => {
  const columns = [
    // ===== THÊM CỘT IMAGE Ở ĐÂY =====
    {
      title: "Image",
      dataIndex: "productImage",
      key: "productImage",
      width: 70, // Đặt chiều rộng cố định cho cột ảnh
      render: (imageUrl) =>
        imageUrl ? (
          <img
            src={imageUrl}
            alt="Product"
            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
            <ImageIcon size={16} className="text-slate-300" />
          </div>
        ),
    },
    // =================================
    {
      title: "Product Name",
      dataIndex: "productName",
      key: "productName",
      render: (text) => (
        <span className="font-bold text-slate-800">{text || "Unknown"}</span>
      ),
    },
    {
      title: "SKU",
      dataIndex: "productSku",
      key: "productSku",
      render: (text) => (
        <span className="text-slate-500 font-mono text-xs">
          {text || "N/A"}
        </span>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
      render: (qty) => (
        <span className="font-bold text-[#39c6c6] bg-[#39c6c6]/10 px-3 py-1 rounded-lg">
          {qty}
        </span>
      ),
    },
  ];

  return (
    <Card className="!rounded-2xl !shadow-sm !border-slate-100">
      <div className="flex items-center gap-2 mb-6">
        <Package size={20} className="text-[#39c6c6]" />
        <Text className="font-bold text-lg text-slate-800">
          Requested Items
        </Text>
      </div>
      <Table
        columns={columns}
        dataSource={items}
        rowKey="id" // Ant Design dựa vào id trong items của ông để làm key
        pagination={false}
        className="custom-details-table"
      />
      <style jsx global>{`
        .custom-details-table .ant-table-thead > tr > th {
          background-color: #f8fafc !important;
          color: #94a3b8 !important;
          font-size: 10px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
      `}</style>
    </Card>
  );
};

export default DetailsProductList;
