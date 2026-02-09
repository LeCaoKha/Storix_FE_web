import { Table } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const DetailsProductList = ({ items }) => {
  const columns = [
    {
      title: "PRODUCT",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <div className="font-bold text-[#2d3748]">{text}</div>
          <div className="text-xs text-gray-400">{record.sku}</div>
        </div>
      ),
    },
    { title: "QTY", dataIndex: "expectedQuantity", key: "qty", align: "right" },
    {
      title: "PRICE",
      dataIndex: "price",
      render: (v) => `${v.toLocaleString()} đ`,
      align: "right",
    },
    {
      title: "TOTAL",
      render: (r) => `${(r.price * r.expectedQuantity).toLocaleString()} đ`,
      align: "right",
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-6 text-[#1a3353] font-bold uppercase text-xs tracking-wider">
        <SearchOutlined className="text-[#4fd1c5]" />
        Product Information
      </div>
      <Table
        dataSource={items}
        columns={columns}
        pagination={false}
        rowKey="id"
        className="custom-table"
      />
    </div>
  );
};

export default DetailsProductList;
