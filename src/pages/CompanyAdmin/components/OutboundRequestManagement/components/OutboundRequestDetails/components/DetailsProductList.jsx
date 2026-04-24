import React from "react";
import { Card, Table, Typography } from "antd";
import { Package } from "lucide-react";

const { Text } = Typography;

const DetailsProductList = ({ items = [] }) => {
  const columns = [
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
        rowKey="id"
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
