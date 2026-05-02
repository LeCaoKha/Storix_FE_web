import React, { useState, useEffect, useRef, forwardRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Typography,
  Button,
  Space,
  Skeleton,
  message,
  Empty,
  Avatar,
} from "antd";
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  ClipboardCheck,
  CheckCircle2,
  PackageSearch,
  Package,
} from "lucide-react";
import dayjs from "dayjs";
import { useReactToPrint } from "react-to-print";
import api from "../../../../../../api/axios";

const { Title, Text } = Typography;

// ==========================================
// 1. TEMPLATE IN BÁO CÁO (CHUẨN FORM TABLE A4)
// Không cần dùng "hidden print:block" nữa, react-to-print sẽ lo việc ẩn/hiện
// ==========================================
const CountPrintTemplate = forwardRef(({ data }, ref) => {
  if (!data) return null;

  const items = data.inventoryCountItems || [];
  const totalSystemQty = items.reduce(
    (sum, item) => sum + (item.systemQuantity || 0),
    0,
  );
  const totalCountedQty = items.reduce(
    (sum, item) => sum + (item.countedQuantity || 0),
    0,
  );
  const totalDiscrepancy = items.reduce(
    (sum, item) => sum + (item.discrepancy || 0),
    0,
  );

  return (
    <div
      ref={ref}
      className="p-10 bg-white text-black font-sans"
      style={{ minHeight: "100vh" }}
    >
      {/* Thông tin Header Hệ thống */}
      <div className="flex justify-between items-start mb-6 text-[12px]">
        <div className="space-y-1">
          <p className="font-bold text-lg">Storix Logistics System</p>
          <p>Hotline: 84764770586</p>
        </div>
        <div className="text-right space-y-1">
          <p>
            Ticket Code:{" "}
            <span className="font-bold">
              INV-{dayjs(data.createdAt).format("YYYYMMDD")}-{data.id}
            </span>
          </p>
          <p>
            Created Date: {dayjs(data.createdAt).format("DD/MM/YYYY HH:mm")}
          </p>
        </div>
      </div>

      {/* Tiêu đề chính */}
      <h1 className="text-center text-2xl font-bold uppercase mb-10 tracking-tight">
        INVENTORY COUNT REPORT
      </h1>

      {/* Thông tin Kho và Nhân viên */}
      <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Warehouse:</span>{" "}
            {data.warehouse?.name || `ID: ${data.warehouseId}`}
          </p>
          <p>
            <span className="font-semibold">Scope Type:</span>{" "}
            {data.scopeType || "N/A"}
          </p>
        </div>
        <div className="space-y-2 text-right">
          <p>
            <span className="font-semibold">Assigned Staff:</span>{" "}
            {data.assignedToNavigation?.fullName || `ID: ${data.assignedTo}`}
          </p>
          <p>
            <span className="font-semibold">Execution Date:</span>{" "}
            {data.executedDay
              ? dayjs(data.executedDay).format("DD/MM/YYYY HH:mm")
              : "Pending"}
          </p>
        </div>
      </div>

      {/* BẢNG SẢN PHẨM CHUẨN FORM IN */}
      <table className="w-full border-collapse border border-black mb-8 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black px-2 py-2 w-12 text-center">
              No.
            </th>
            <th className="border border-black px-2 py-2 text-left">
              Product Name / SKU
            </th>
            <th className="border border-black px-2 py-2 w-24 text-center">
              System Qty
            </th>
            <th className="border border-black px-2 py-2 w-24 text-center">
              Counted Qty
            </th>
            <th className="border border-black px-2 py-2 w-24 text-center">
              Discrepancy
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id}>
              <td className="border border-black px-2 py-2 text-center">
                {index + 1}
              </td>
              <td className="border border-black px-2 py-2">
                <div className="font-bold">
                  {item.product?.name || "Unknown"}
                </div>
                <div className="text-[10px] text-gray-600 italic">
                  SKU: {item.product?.sku || "N/A"}
                </div>
              </td>
              <td className="border border-black px-2 py-2 text-center">
                {item.systemQuantity}
              </td>
              <td className="border border-black px-2 py-2 text-center">
                {item.countedQuantity !== null ? item.countedQuantity : "-"}
              </td>
              <td className="border border-black px-2 py-2 text-center font-bold">
                {item.discrepancy !== null
                  ? item.discrepancy > 0
                    ? `+${item.discrepancy}`
                    : item.discrepancy
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tổng kết số liệu (Góc phải dưới) */}
      <div className="flex justify-end">
        <div className="w-72 space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span>Total SKUs:</span>
            <span className="font-bold">{items.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Total System Qty:</span>
            <span>{totalSystemQty}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Total Counted Qty:</span>
            <span>{totalCountedQty}</span>
          </div>
          <div className="flex justify-between items-center border-t border-black pt-3 font-bold text-lg">
            <span>NET DISCREPANCY:</span>
            <span>
              {totalDiscrepancy > 0 ? `+${totalDiscrepancy}` : totalDiscrepancy}
            </span>
          </div>
        </div>
      </div>

      {/* Chữ ký */}
      <div className="mt-20 grid grid-cols-3 text-center text-sm italic">
        <div className="space-y-20">
          <p className="font-bold not-italic">Prepared By</p>
          <p>(Signature & Full Name)</p>
        </div>
        <div className="space-y-20">
          <p className="font-bold not-italic">Assigned Staff</p>
          <p>(Signature & Full Name)</p>
        </div>
        <div className="space-y-20">
          <p className="font-bold not-italic">Warehouse Manager</p>
          <p>(Signature & Full Name)</p>
        </div>
      </div>
    </div>
  );
});

// ==========================================
// 2. MAIN COMPONENT CHÍNH
// ==========================================
const InventoryCountDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const companyId = localStorage.getItem("companyId");

  const [loading, setLoading] = useState(true);
  const [ticketData, setTicketData] = useState(null);

  // Tạo ref để nhắm mục tiêu in
  const printRef = useRef();

  // Sử dụng thư viện react-to-print
  const handleExportPDF = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Count_Ticket_INV-${ticketData?.id || id}`,
  });

  const fetchTicketDetails = async () => {
    if (!companyId || !id) return;
    setLoading(true);
    try {
      const res = await api.get(`/InventoryCount/tickets/${companyId}/${id}`);
      setTicketData(res.data);
    } catch (error) {
      console.error("Fetch Details Error:", error);
      message.error("Failed to load inventory count details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [id, companyId]);

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "gold";
      case "Counting":
        return "blue";
      case "Completed":
        return "green";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Product Info",
      dataIndex: "product",
      key: "productInfo",
      render: (product) => (
        <div className="flex items-center gap-4">
          <Avatar
            shape="square"
            size={48}
            src={product?.image}
            icon={<Package size={20} />}
            className="!bg-slate-100 !border !border-slate-200 !text-slate-300"
          />
          <div className="flex flex-col max-w-[200px] lg:max-w-[300px]">
            <Text
              className="!font-bold !text-slate-800 truncate"
              title={product?.name}
            >
              {product?.name || "Unknown Product"}
            </Text>
            <Text className="!text-[10px] !text-slate-400 !font-mono">
              SKU: {product?.sku || "N/A"}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "System Qty",
      dataIndex: "systemQuantity",
      key: "systemQuantity",
      align: "center",
      render: (val) => (
        <span className="font-mono font-bold text-slate-500 text-base">
          {val}
        </span>
      ),
    },
    {
      title: "Counted Qty",
      dataIndex: "countedQuantity",
      key: "countedQuantity",
      align: "center",
      render: (val) => (
        <span
          className={`font-mono font-bold text-base ${
            val === null ? "text-slate-300 italic text-sm" : "text-[#39c6c6]"
          }`}
        >
          {val !== null ? val : "Pending"}
        </span>
      ),
    },
    {
      title: "Discrepancy",
      dataIndex: "discrepancy",
      key: "discrepancy",
      align: "center",
      render: (val) => {
        if (val === null)
          return <span className="text-slate-300 font-mono">---</span>;

        let colorClass = "text-slate-500";
        if (val > 0) colorClass = "text-emerald-500";
        if (val < 0) colorClass = "text-rose-500";

        return (
          <Tag
            color={val === 0 ? "default" : val > 0 ? "success" : "error"}
            className="!rounded-lg !px-3 !py-1 !font-mono !font-bold !m-0 !border-none"
          >
            {val > 0 ? `+${val}` : val}
          </Tag>
        );
      },
    },
  ];

  if (loading)
    return (
      <div className="p-12 h-screen bg-[#F8FAFC]">
        <Skeleton active avatar paragraph={{ rows: 10 }} />
      </div>
    );

  if (!ticketData)
    return (
      <div className="h-screen bg-[#F8FAFC] flex justify-center items-start pt-20">
        <Empty description="Inventory count ticket not found" />
      </div>
    );

  const isCompleted = ticketData.status === "Completed";
  const items = ticketData.inventoryCountItems || [];

  return (
    <>
      {/* 
        Giao diện Web 
      */}
      <div className="!bg-[#F8FAFC] !min-h-screen !pb-20">
        {/* HEADER */}
        <div className="!bg-[#F8FAFC] !px-12 !py-6 !sticky !top-0 !z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                type="text"
                icon={<ArrowLeft size={20} />}
                onClick={() => navigate(-1)}
                className="hover:!bg-white !rounded-full !w-10 !h-10 !flex !items-center !justify-center !text-slate-600 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-3">
                  <Title
                    level={3}
                    className="!m-0 !font-black !tracking-tight text-slate-800"
                  >
                    Count Ticket #{String(ticketData.id).padStart(3, "0")}
                  </Title>
                  <Tag
                    color={getStatusColor(ticketData.status)}
                    className="!rounded-full !px-3 !py-0.5 !font-bold !uppercase !border-none tracking-widest text-[10px]"
                  >
                    {ticketData.status}
                  </Tag>
                </div>
                <Text className="!text-slate-400 !text-sm font-medium">
                  {ticketData.name} • Created on{" "}
                  {formatDate(ticketData.createdAt)}
                </Text>
              </div>
            </div>

            <Space>
              <Button
                icon={<Calendar size={16} />}
                className="!h-10 !rounded-xl !font-bold border-slate-200 text-slate-600 hover:text-slate-800"
                onClick={handleExportPDF} // Dùng react-to-print tại đây
              >
                Export PDF
              </Button>
              {!isCompleted && (
                <Button
                  type="primary"
                  className="!h-10 !bg-[#39c6c6] !border-none !rounded-xl !font-bold !px-6 shadow-lg shadow-[#39c6c6]/20 hover:!bg-[#2eb1b1]"
                  onClick={() =>
                    message.info("Counting process feature coming soon")
                  }
                >
                  Execute Count
                </Button>
              )}
            </Space>
          </div>
        </div>

        {/* NỘI DUNG WEB */}
        <div className="!px-12 !mt-8 flex flex-col lg:flex-row gap-6">
          <div className="flex-[2] space-y-6">
            <Card className="!rounded-2xl !shadow-sm !border-slate-100">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-50">
                <PackageSearch className="text-[#39c6c6]" size={20} />
                <h3 className="!text-lg !font-extrabold !text-slate-800 !m-0">
                  Products List
                </h3>
              </div>

              <Table
                columns={columns}
                dataSource={items}
                rowKey="id"
                pagination={false}
                className="storix-table custom-count-table"
                locale={{
                  emptyText: (
                    <div className="py-10 text-slate-400">
                      <Package size={32} className="mx-auto mb-2 opacity-20" />
                      <p>No products mapped to this count.</p>
                    </div>
                  ),
                }}
              />
            </Card>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <Card
                title="Session Details"
                className="!rounded-2xl !shadow-sm !border-slate-100 custom-card-header"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <Text className="text-slate-400 font-medium">
                      Scope Type
                    </Text>
                    <Tag
                      color="geekblue"
                      className="!m-0 !font-bold !rounded-md"
                    >
                      {ticketData.scopeType || "N/A"}
                    </Tag>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <Text className="text-slate-400 font-medium">
                      Planned Execution
                    </Text>
                    <Text className="font-bold text-slate-700">
                      {formatDate(ticketData.plannedAt)}
                    </Text>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <Text className="text-slate-400 font-medium">
                      Assigned Staff
                    </Text>
                    <div className="flex items-center gap-2">
                      <Avatar
                        size="small"
                        className="bg-slate-100 text-slate-400"
                      >
                        <User size={14} />
                      </Avatar>
                      <Text className="font-bold text-slate-700">
                        {ticketData.assignedToNavigation?.fullName ||
                          `ID: ${ticketData.assignedTo}`}
                      </Text>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <Text className="text-slate-400 font-medium">
                      Warehouse
                    </Text>
                    <Text className="font-bold text-slate-700">
                      {ticketData.warehouse?.name ||
                        `ID: ${ticketData.warehouseId}`}
                    </Text>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                      <FileText size={14} />
                      <Text className="!text-[10px] !font-bold !uppercase !tracking-widest text-slate-400">
                        Internal Notes
                      </Text>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <Text className="text-slate-600 italic text-sm">
                        {ticketData.description ||
                          "No description provided for this session."}
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <Card className="!rounded-2xl !shadow-sm !border-none !bg-gradient-to-br from-[#39c6c6] to-[#2ba4a4]">
                <div className="flex flex-col items-center py-4">
                  <ClipboardCheck
                    size={36}
                    className="text-white opacity-80 mb-3"
                  />
                  <Title level={1} className="!text-white !m-0 !font-black">
                    {items.length}
                  </Title>
                  <Text className="text-white/80 font-bold uppercase tracking-widest text-[10px] mt-1">
                    Total SKUs to Count
                  </Text>
                </div>
              </Card>
            </div>

            {isCompleted && (
              <div>
                <Card className="!rounded-2xl !shadow-sm !border-emerald-100 !bg-emerald-50">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-500" size={28} />
                    <div>
                      <div className="text-emerald-700 font-extrabold uppercase tracking-wide text-xs mb-1">
                        Execution Finished
                      </div>
                      <div className="text-emerald-600 font-medium text-sm">
                        {formatDate(ticketData.executedDay)}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 
        COMPONENT IN: Bọc trong display: none mặc định để không hiện lên Web,
        react-to-print sẽ tự động "lôi" nó ra khi tạo bản in PDF.
      */}
      <div style={{ display: "none" }}>
        <CountPrintTemplate ref={printRef} data={ticketData} />
      </div>

      <style jsx global>{`
        .custom-card-header .ant-card-head {
          border-bottom: none !important;
          padding-top: 24px;
        }
        .custom-card-header .ant-card-head-title {
          font-weight: 800 !important;
          color: #1e293b !important;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 12px;
        }
        .custom-count-table .ant-table-thead > tr > th {
          background-color: #f8fafc !important;
          color: #64748b !important;
          font-size: 10px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
      `}</style>
    </>
  );
};

export default InventoryCountDetails;
