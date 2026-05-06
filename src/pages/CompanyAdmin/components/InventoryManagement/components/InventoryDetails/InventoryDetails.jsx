import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../../../api/axios";
import {
  Table,
  Input,
  Button,
  message,
  Typography,
  Card,
  ConfigProvider,
  Tag,
  Tooltip,
  Avatar,
} from "antd";
import {
  ArrowLeft,
  Search,
  RefreshCw,
  Box,
  ShoppingCart,
  MapPin,
  Info,
  Image as ImageIcon,
} from "lucide-react";

const { Title, Text } = Typography;

const InventoryDetails = () => {
  const { id: warehouseId } = useParams();
  const navigate = useNavigate();

  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const companyId = localStorage.getItem("companyId");
  const roleId = Number(localStorage.getItem("roleId"));

  // --- FETCH INVENTORY LOGIC ---
  const fetchInventory = async () => {
    if (!companyId || !warehouseId) {
      message.error("Missing identification data.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(
        `/company-warehouses/${companyId}/warehouses/${warehouseId}/inventory`,
      );
      setInventoryData(response.data || []);
    } catch (error) {
      console.error("Fetch inventory error:", error);
      message.error(
        error.response?.data?.message || "Failed to load inventory data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [companyId, warehouseId]);

  // --- RENDER SUB-TABLE (LOCATIONS) ---
  const expandedRowRender = (record) => {
    const subColumns = [
      {
        title: "Zone",
        dataIndex: "zoneCode",
        key: "zoneCode",
        render: (text) => <Tag color="blue">{text}</Tag>,
      },
      {
        title: "Shelf",
        dataIndex: "shelfCode",
        key: "shelfCode",
        render: (text) => <span className="font-bold">{text}</span>,
      },
      {
        title: "Bins Breakdown",
        key: "bins",
        render: (_, loc) => {
          if (!loc.bins || loc.bins.length === 0) {
            return (
              <span className="text-slate-400 italic">Unassigned Bins</span>
            );
          }
          return (
            <div className="flex flex-wrap gap-2">
              {loc.bins.map((bin) => (
                <Tooltip
                  key={bin.binId}
                  title={`Occupancy: ${bin.occupancyPercentage}%`}
                >
                  <Tag className="!m-0 !font-mono text-slate-600 bg-slate-100 border-slate-200">
                    {bin.binCode}
                  </Tag>
                </Tooltip>
              ))}
            </div>
          );
        },
      },
      {
        title: "Qty in Shelf",
        dataIndex: "quantity",
        key: "quantity",
        align: "right",
        render: (qty) => (
          <span className="font-black text-[#39c6c6]">{qty}</span>
        ),
      },
    ];

    return (
      <Card
        bodyStyle={{ padding: "12px" }}
        className="!bg-slate-50 !border-slate-200 !rounded-xl !mb-2"
        title={
          <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider font-bold">
            <MapPin size={14} /> Specific Locations
          </div>
        }
      >
        <Table
          columns={subColumns}
          dataSource={record.locations}
          pagination={false}
          rowKey={(loc) => `${record.productId}-${loc.shelfId}`}
          size="small"
        />
      </Card>
    );
  };

  // --- MAIN TABLE COLUMNS ---
  const columns = [
    {
      title: "Product",
      key: "productInfo",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            shape="square"
            size={48}
            src={record.productImage}
            icon={<ImageIcon size={20} className="text-slate-400" />}
            className="shrink-0 bg-slate-100 border border-slate-200"
          />
          <div className="flex flex-col min-w-0">
            <Text
              className="!font-bold !text-slate-800 truncate"
              style={{ maxWidth: "300px" }}
              title={record.productName}
            >
              {record.productName}
            </Text>
            <span className="!font-mono !text-slate-500 !bg-slate-100 !px-1.5 !py-0.5 !rounded !text-[10px] w-fit mt-1">
              {record.productSku}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Total Stock",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 120,
      render: (q) => <span className="font-semibold text-slate-600">{q}</span>,
    },
    {
      title: "Available",
      dataIndex: "availableQuantity",
      key: "availableQuantity",
      width: 150,
      align: "right",
      render: (qty) => (
        <div className="flex flex-col items-end">
          <span className="!font-black !text-xl !text-[#39c6c6]">{qty}</span>
          <Text className="!text-[10px] !text-slate-400 !uppercase">Units</Text>
        </div>
      ),
    },
  ];

  const filteredData = inventoryData.filter(
    (item) =>
      item.productName?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.productSku?.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#39c6c6" } }}>
      <div className="!bg-slate-50 !min-h-screen !font-sans !text-slate-900 !pb-12">
        <section className="md:!px-12 lg:!px-10 !pt-8 !pb-0">
          {/* HEADER */}
          <div className="!flex !flex-col md:!flex-row !justify-between !items-start md:!items-center !mb-8 !gap-4">
            <div className="!flex !items-center !gap-4">
              {roleId !== 3 && (
                <Button
                  type="text"
                  icon={<ArrowLeft size={20} />}
                  onClick={() => navigate(-1)}
                  className="hover:!text-[#39c6c6] !flex !items-center !justify-center !bg-white !rounded-full !w-10 !h-10 !shadow-sm"
                />
              )}
              <div>
                <Title
                  level={3}
                  className="!mb-0 !font-black !tracking-tight !flex !items-center !gap-2"
                >
                  <Box className="!text-[#39c6c6]" size={24} />
                  Live Inventory
                </Title>
              </div>
            </div>

            <div className="!flex !gap-3">
              <Button
                icon={
                  <RefreshCw
                    size={16}
                    className={loading ? "!animate-spin" : ""}
                  />
                }
                onClick={fetchInventory}
                className="!h-10 !px-5 !rounded-xl !border-slate-200 !bg-white !font-bold !text-slate-600 hover:!text-[#39c6c6] !shadow-sm"
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<ShoppingCart size={16} />}
                onClick={() =>
                  navigate("/company-admin/inbound-request-management/create")
                }
                className="!h-10 !px-5 !rounded-xl !bg-[#39c6c6] !border-none hover:!bg-[#2eb1b1] !shadow-lg !shadow-[#39c6c6]/20 !font-bold"
              >
                Inbound Order
              </Button>
            </div>
          </div>

          {/* MAIN TABLE CARD */}
          <Card className="!rounded-[1.5rem] !shadow-xl !shadow-slate-200/50 !border-none !w-full">
            <div className="!flex !justify-between !items-center !mb-6">
              <div className="flex items-center gap-2">
                <h3 className="!text-lg !font-bold !text-slate-800 !m-0">
                  Stock Overview
                </h3>
                <Tooltip title="Expand rows to see specific Bin locations">
                  <Info size={14} className="text-slate-400 cursor-help" />
                </Tooltip>
              </div>
              <Input
                placeholder="Search SKU or Name..."
                prefix={<Search size={16} className="!text-slate-400 !mr-2" />}
                className="!w-72 !h-10 !rounded-xl !bg-slate-50 hover:!border-[#39c6c6] focus-within:!border-[#39c6c6]"
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <Table
              columns={columns}
              dataSource={filteredData}
              loading={loading}
              rowKey="productId"
              expandable={{
                expandedRowRender,
                rowExpandable: (record) => record.locations?.length > 0,
              }}
              pagination={{ pageSize: 10 }}
              className="!border-t !border-slate-100 !pt-2 custom-inventory-table"
              onRow={(record) => ({
                onDoubleClick: () => {
                  navigate(
                    `/company-admin/product-management/details/${record.productId}`,
                  );
                },
              })}
            />
          </Card>
        </section>
      </div>

      <style jsx="true">{`
        .custom-inventory-table .ant-table-row {
          transition: all 0.2s;
        }
        .custom-inventory-table .ant-table-row:hover {
          background-color: #f8fafc !important;
        }
      `}</style>
    </ConfigProvider>
  );
};

export default InventoryDetails;
