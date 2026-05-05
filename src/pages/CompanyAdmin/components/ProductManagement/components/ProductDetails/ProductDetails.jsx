import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../../../api/axios";
import {
  Card,
  Button,
  Typography,
  Tag,
  Spin,
  Image,
  message,
  Row,
  Col,
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
  Scale,
  Ruler,
  TrendingUp,
  Zap,
  Droplet,
  Snowflake,
  AlertTriangle,
  Gem,
  Brush,
  PackageOpen,
  Maximize,
  Tags,
} from "lucide-react";

const { Title, Text } = Typography;

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const roleId = Number(localStorage.getItem("roleId"));

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
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  // Hàm phụ trợ lấy màu cho Popularity Score
  const getPopularityColor = (score) => {
    if (score == null) return "text-slate-700";
    if (score >= 80) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-rose-500";
  };

  // Hàm phụ trợ lấy giá mới nhất từ mảng productPrices
  const getLatestPrice = () => {
    if (!product?.productPrices || product.productPrices.length === 0) {
      return "N/A";
    }
    // Sắp xếp mảng giá theo ngày giảm dần và lấy cái đầu tiên
    const sortedPrices = [...product.productPrices].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
    return sortedPrices[0].price.toLocaleString("vi-VN") + " ₫";
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

          {/* Chỉ hiển thị nút Edit khi roleId là 2 */}
          {roleId === 2 && (
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
          )}
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
              </div>
            </Card>
          </Col>

          {/* Cột phải: Thông tin chi tiết */}
          <Col xs={24} lg={15}>
            <Card className="!rounded-[2.5rem] !shadow-2xl shadow-slate-200/50 !border-none p-6 bg-white h-full">
              <div className="mb-6">
                {/* HIỂN THỊ CÁC TAG ĐIỀU KIỆN LƯU TRỮ */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {product?.isEsd && (
                    <Tag
                      color="volcano"
                      className="!rounded-full !px-4 !py-0.5 !border-none !font-black !uppercase !text-[10px] !m-0"
                    >
                      <Zap size={10} className="inline mr-1 mb-0.5" /> ESD
                      Required
                    </Tag>
                  )}
                  {product?.isMsd && (
                    <Tag
                      color="blue"
                      className="!rounded-full !px-4 !py-0.5 !border-none !font-black !uppercase !text-[10px] !m-0"
                    >
                      <Droplet size={10} className="inline mr-1 mb-0.5" /> MSD
                      Required
                    </Tag>
                  )}
                  {product?.isCold && (
                    <Tag
                      color="cyan"
                      className="!rounded-full !px-4 !py-0.5 !border-none !font-black !uppercase !text-[10px] !m-0"
                    >
                      <Snowflake size={10} className="inline mr-1 mb-0.5" />{" "}
                      Cold Storage
                    </Tag>
                  )}
                  {product?.isVulnerable && (
                    <Tag
                      color="orange"
                      className="!rounded-full !px-4 !py-0.5 !border-none !font-black !uppercase !text-[10px] !m-0"
                    >
                      <AlertTriangle size={10} className="inline mr-1 mb-0.5" />{" "}
                      Fragile
                    </Tag>
                  )}
                  {product?.isHighValue && (
                    <Tag
                      color="gold"
                      className="!rounded-full !px-4 !py-0.5 !border-none !font-black !uppercase !text-[10px] !m-0"
                    >
                      <Gem size={10} className="inline mr-1 mb-0.5" /> High
                      Value
                    </Tag>
                  )}

                  {!product?.isEsd &&
                    !product?.isMsd &&
                    !product?.isCold &&
                    !product?.isVulnerable &&
                    !product?.isHighValue && (
                      <Tag className="!rounded-full !px-4 !py-0.5 !border !border-slate-200 !bg-slate-50 !font-black !uppercase !text-[10px] !m-0 !text-slate-500">
                        Standard Storage
                      </Tag>
                    )}
                </div>

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

              <Divider className="!my-6 border-slate-100" />

              {/* ===== LƯỚI THÔNG TIN CHI TIẾT (CẬP NHẬT MỚI) ===== */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Hàng 1 */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-[#39C6C6]/30 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Hash size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      SKU Code
                    </span>
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-700 bg-slate-200/60 inline-block px-2.5 py-1 rounded-lg truncate w-full">
                    {product?.sku}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-[#39C6C6]/30 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Layers size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Category
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-800 truncate mt-1.5">
                    {product?.category?.name || "Uncategorized"}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-[#39C6C6]/30 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Tags size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Latest Price
                    </span>
                  </div>
                  <div className="text-base font-black text-emerald-500 mt-1">
                    {getLatestPrice()}
                  </div>
                </div>

                {/* Hàng 2 */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-[#39C6C6]/30 hover:shadow-sm transition-all duration-300 md:col-span-2">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Ruler size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Dimensions (L x W x H)
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-800 flex items-baseline gap-1.5 mt-1">
                    <span>{product?.length || 0}</span>
                    <span className="text-slate-400 text-xs font-normal px-1">
                      x
                    </span>
                    <span>{product?.width || 0}</span>
                    <span className="text-slate-400 text-xs font-normal px-1">
                      x
                    </span>
                    <span>{product?.height || 0}</span>
                    <span className="text-slate-400 text-xs ml-1">cm</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-[#39C6C6]/30 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Scale size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Weight
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-800 mt-1">
                    {product?.weight != null ? `${product.weight} kg` : "N/A"}
                  </div>
                </div>

                {/* Hàng 3: Bổ sung các trường mới */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-[#39C6C6]/30 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Brush size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Material
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-800 truncate mt-1">
                    {product?.material || "N/A"}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-[#39C6C6]/30 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Maximize size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Size Std
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-800 truncate mt-1">
                    {product?.sizeStandard || "N/A"}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-[#39C6C6]/30 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <PackageOpen size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Package
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-800 truncate mt-1">
                    {product?.packageType || "N/A"}
                  </div>
                </div>

                {/* Hàng 4 */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-[#39C6C6]/30 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Package size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Unit
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-800 uppercase mt-1">
                    {product?.unit || "N/A"}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-[#39C6C6]/30 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <TrendingUp size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Popularity
                    </span>
                  </div>
                  <div
                    className={`text-lg font-black mt-1 ${getPopularityColor(
                      product?.popularityScore,
                    )}`}
                  >
                    {product?.popularityScore !== null
                      ? `${product.popularityScore} pts`
                      : "N/A"}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-[#39C6C6]/30 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Calendar size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Reg Date
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-800 mt-1 truncate">
                    {product?.createdAt
                      ? new Date(product.createdAt).toLocaleDateString("en-GB")
                      : "N/A"}
                  </div>
                </div>
              </div>
              {/* ===== KẾT THÚC LƯỚI THÔNG TIN ===== */}

              {/* Phần mô tả chi tiết */}
              <div className="mt-6 bg-[#f8fafc] p-6 rounded-[1.5rem] border border-slate-100 relative overflow-hidden">
                <div className="absolute top-[-10px] right-[-10px] p-4 opacity-[0.03]">
                  <Info size={100} />
                </div>
                <Title
                  level={5}
                  className="!flex !items-center !gap-2 !text-slate-400 !uppercase !text-[10px] !font-black !tracking-[0.2em] !mb-3"
                >
                  Product Description
                </Title>
                <Text className="text-slate-600 leading-relaxed text-sm block whitespace-pre-wrap relative z-10">
                  {product?.description ||
                    "No specific description or technical notes provided for this product SKU."}
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </section>

      <style jsx="true">{`
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
