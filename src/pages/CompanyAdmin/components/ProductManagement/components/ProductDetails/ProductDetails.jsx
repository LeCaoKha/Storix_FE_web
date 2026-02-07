import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../../../api/axios";
import {
  Card,
  Button,
  Typography,
  Tag,
  Descriptions,
  Badge,
  Spin,
  Image,
  message,
  Row,
  Col,
  Space,
  Divider,
} from "antd";
import {
  ArrowLeft,
  Edit3,
  Package,
  Hash,
  Calendar,
  Layers,
  Info,
  Box,
  CircleDollarSign,
} from "lucide-react";

const { Title, Text } = Typography;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu sản phẩm từ API
  const fetchProductDetails = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      message.error("User session expired. Please login again.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/Products/get-by-id/${userId}/${id}`);
      setProduct(response.data);
    } catch (error) {
      message.error("Failed to load product details");
      navigate(-1); // Quay lại trang trước nếu lỗi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <Spin
          size="large"
          tip={
            <span className="mt-4 font-bold text-[#39C6C6]">
              Fetching Product Specs...
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <section className="md:px-16 lg:px-12 pt-7 pb-10">
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={<ArrowLeft size={24} />}
              onClick={() => navigate(-1)}
              className="!flex !items-center !justify-center hover:!bg-white hover:!shadow-md !rounded-full !h-12 !w-12 transition-all text-slate-600"
            />
            <div>
              <Title
                level={2}
                className="!mb-0 !font-extrabold !tracking-tight !text-slate-800"
              >
                Product Specifications
              </Title>
              <Text className="text-slate-400 font-medium">
                Detailed view for SKU: {product?.sku}
              </Text>
            </div>
          </div>

          <Button
            type="primary"
            onClick={() =>
              navigate(`/company-admin/product-management/edit/${id}`)
            }
            icon={<Edit3 size={18} />}
            className="!h-12 !px-8 !bg-[#39C6C6] !border-none !rounded-2xl !font-bold hover:!bg-[#2eb1b1] !shadow-lg !shadow-[#39C6C6]/20 !flex !items-center !gap-2"
          >
            Edit Product
          </Button>
        </div>

        {/* --- MAIN CONTENT --- */}
        <Row gutter={[32, 32]}>
          {/* Cột trái: Hình ảnh & Trạng thái nhanh */}
          <Col xs={24} lg={9}>
            <Card className="!rounded-[2.5rem] !shadow-2xl shadow-slate-200/50 overflow-hidden !border-none p-2 bg-white">
              <div className="flex flex-col items-center">
                <Image
                  src={product?.imageUrl || product?.image}
                  alt={product?.name}
                  fallback="https://placehold.co/600x600?text=No+Image+Available"
                  className="rounded-3xl object-contain !h-[450px] !w-full bg-slate-50"
                  placeholder={
                    <div className="w-full h-[450px] bg-slate-100 animate-pulse rounded-3xl" />
                  }
                />
                <div className="mt-6 w-full px-4 pb-4">
                  <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="flex flex-col">
                      <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                        Inventory Status
                      </Text>
                      <Badge
                        status="processing"
                        text={
                          <span className="font-bold text-slate-700">
                            Available
                          </span>
                        }
                      />
                    </div>
                    <div className="text-right">
                      <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest block">
                        Unit Price
                      </Text>
                      <Text className="text-xl font-black text-[#39C6C6]">
                        {formatCurrency(product?.price)}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Cột phải: Thông tin chi tiết */}
          <Col xs={24} lg={15}>
            <Card className="!rounded-[2.5rem] !shadow-2xl shadow-slate-200/50 !border-none p-6 bg-white">
              <div className="mb-8">
                <Tag
                  color="cyan"
                  className="!rounded-full !px-5 !py-0.5 !border-none !font-black !uppercase !text-[10px] !mb-3"
                >
                  {product?.type?.name || "Standard SKU"}
                </Tag>
                <Title
                  level={1}
                  className="!font-black !text-slate-800 !mt-0 !mb-2 uppercase tracking-tighter"
                >
                  {product?.name}
                </Title>
                <div className="flex items-center gap-2 text-[#39C6C6]">
                  <Box size={16} />
                  <Text className="font-bold text-[#39C6C6] uppercase text-xs tracking-widest">
                    Master Product Data
                  </Text>
                </div>
              </div>

              <Divider className="!my-8" />

              <Descriptions
                column={{ xs: 1, sm: 2 }}
                layout="vertical"
                className="product-details-descriptions"
              >
                <Descriptions.Item
                  label={
                    <span className="label-style">
                      <Hash size={14} /> SKU Code
                    </span>
                  }
                >
                  <Text className="value-style-mono">{product?.sku}</Text>
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <span className="label-style">
                      <Layers size={14} /> Category
                    </span>
                  }
                >
                  <Text className="value-style">
                    {product?.category || "Uncategorized"}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <span className="label-style">
                      <Package size={14} /> Unit of Measure
                    </span>
                  }
                >
                  <Text className="value-style">{product?.unit || "N/A"}</Text>
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <span className="label-style">
                      <Calendar size={14} /> Registration Date
                    </span>
                  }
                >
                  <Text className="value-style">
                    {product?.createdAt
                      ? new Date(product.createdAt).toLocaleString("en-GB")
                      : "Not recorded"}
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              {/* Phần mô tả chi tiết */}
              <div className="mt-10 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Info size={80} />
                </div>
                <Title
                  level={5}
                  className="!flex !items-center !gap-2 !text-slate-400 !uppercase !text-[10px] !font-black !tracking-[0.2em] !mb-4"
                >
                  Product Description
                </Title>
                <Text className="text-slate-600 leading-relaxed text-base italic block whitespace-pre-wrap">
                  {product?.description ||
                    "No specific description or technical notes provided for this product SKU."}
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </section>

      <style jsx="true">{`
        .product-details-descriptions .ant-descriptions-item-label {
          padding-bottom: 12px !important;
        }
        .label-style {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #94a3b8;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.1em;
        }
        .value-style {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }
        .value-style-mono {
          font-family:
            ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 15px;
          font-weight: 700;
          color: #334155;
          background: #f1f5f9;
          padding: 4px 12px;
          border-radius: 8px;
        }
        .ant-image-img {
          transition: transform 0.3s ease !important;
        }
        .ant-image-img:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default ProductDetails;
