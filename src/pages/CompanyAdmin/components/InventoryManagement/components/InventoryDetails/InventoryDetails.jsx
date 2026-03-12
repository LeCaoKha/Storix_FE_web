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
} from "antd";
import { ArrowLeft, Search, RefreshCw, Box, ShoppingCart } from "lucide-react";

const { Title, Text } = Typography;

const InventoryDetails = () => {
  const { id: warehouseId } = useParams();
  const navigate = useNavigate();

  const [inventoryData, setInventoryData] = useState({
    items: [],
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const companyId = localStorage.getItem("companyId");

  // --- FETCH INVENTORY LOGIC ---
  const fetchInventory = async () => {
    if (!companyId) {
      message.error("Company ID not found. Please log in again.");
      return;
    }
    if (!warehouseId) {
      message.error("Warehouse ID is missing.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(
        `/company-warehouses/${companyId}/warehouses/${warehouseId}/inventory`,
      );
      setInventoryData(response.data);
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

  const items = inventoryData.items || [];

  // --- ANTD TABLE COLUMNS ---
  const columns = [
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      width: 200,
      render: (sku) => (
        <span className="!font-mono !text-slate-500 !bg-slate-100 !px-3 !py-1.5 !rounded-md">
          {sku}
        </span>
      ),
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <span className="!font-bold !text-slate-800 !text-base">{text}</span>
      ),
    },
    {
      title: "Quantity Available",
      dataIndex: "quantity",
      key: "quantity",
      width: 200,
      render: (quantity) => (
        <span className="!font-black !text-lg !text-slate-700">{quantity}</span>
      ),
    },
  ];

  const filteredData = items.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#39c6c6" } }}>
      <div className="!bg-slate-50 !min-h-screen !font-sans !text-slate-900 !pb-12">
        <section className="md:!px-12 lg:!px-10 !pt-8 !pb-0">
          {/* PAGE HEADER */}
          <div className="!flex !flex-col md:!flex-row !justify-between !items-start md:!items-center !mb-8 !gap-4">
            <div className="!flex !items-center !gap-4">
              <Button
                type="text"
                icon={<ArrowLeft size={20} />}
                onClick={() => navigate(-1)}
                className="hover:!text-[#39c6c6] !flex !items-center !justify-center !bg-white !rounded-full !w-10 !h-10 !shadow-sm"
              />
              <div>
                <Title
                  level={3}
                  className="!mb-0 !font-black !tracking-tight !flex !items-center !gap-2"
                >
                  <Box className="!text-[#39c6c6]" size={24} />
                  Facility Inventory
                </Title>
                <Text className="!text-slate-400 !text-sm">
                  Warehouse ID:{" "}
                  <span className="!font-mono !text-[#39c6c6]">
                    {warehouseId}
                  </span>
                </Text>
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
                className="!h-10 !px-5 !rounded-xl !border-slate-200 !bg-white !font-bold !text-slate-600 hover:!text-[#39c6c6] hover:!border-[#39c6c6] !shadow-sm"
              >
                Refresh
              </Button>
              {/* NÚT TẠO ĐƠN NHẬP HÀNG MỚI */}
              <Button
                type="primary"
                icon={<ShoppingCart size={16} />}
                onClick={() =>
                  navigate("/company-admin/inbound-request-management/create")
                }
                className="!h-10 !px-5 !rounded-xl !bg-[#39c6c6] !border-none hover:!bg-[#2eb1b1] !shadow-lg !shadow-[#39c6c6]/20 !font-bold"
              >
                Create Inbound Order
              </Button>
            </div>
          </div>

          {/* MAIN CONTENT (FULL WIDTH) */}
          <Card className="!rounded-[1.5rem] !shadow-xl !shadow-slate-200/50 !border-none !w-full">
            <div className="!flex !justify-between !items-center !mb-6">
              <h3 className="!text-lg !font-bold !text-slate-800 !m-0">
                Stock Overview
              </h3>
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
              pagination={{ pageSize: 10, className: "!px-0" }}
              className="!border-t !border-slate-100 !pt-2"
              onRow={(record) => ({
                onClick: () => {
                  navigate(
                    `/company-admin/product-management/details/${record.productId}`,
                  );
                },
                className:
                  "!cursor-pointer hover:!bg-slate-50 !transition-colors",
              })}
            />
          </Card>
        </section>
      </div>
    </ConfigProvider>
  );
};

export default InventoryDetails;
