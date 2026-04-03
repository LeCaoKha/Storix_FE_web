import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Spin, message } from "antd";
import { useReactToPrint } from "react-to-print";
import api from "../../../../../../api/axios";

// Lấy các component UI (Giả sử bạn đã tạo hoặc tái sử dụng từ thư mục components của Outbound)
import DetailsHeader from "./components/DetailsHeader";
import DetailsProductList from "./components/DetailsProductList";
import DetailsSidebarInfo from "./components/DetailsSidebarInfo";
import DetailsPayment from "./components/DetailsPayment";
import DetailsNotes from "./components/DetailsNotes";
import OutboundPrintTemplate from "./components/OutboundPrintTemplate";

const OutboundRequestDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  // printRef trỏ tới Template In, không trỏ tới giao diện Web
  const printRef = useRef(null);

  const companyId = localStorage.getItem("companyId");
  const userId = localStorage.getItem("userId");

  // Cấu hình in ấn chuyên nghiệp
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Outbound_Order_${data?.referenceCode || id}`,
  });

  // Lấy dữ liệu chi tiết yêu cầu xuất kho
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/InventoryOutbound/requests/${companyId}/${id}`,
      );

      console.log("ccc: ", res);

      setData(res.data);
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to load outbound request details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && companyId) {
      fetchData();
    }
  }, [id, companyId]);

  // Hàm xử lý phê duyệt (Approve)
  const handleApprove = async () => {
    if (!userId) {
      message.error("User ID not found. Please login again.");
      return;
    }

    try {
      setIsApproving(true);
      const payload = {
        approverId: Number(userId),
        status: "Approved",
      };

      // Gọi API cập nhật trạng thái Outbound
      await api.put(
        `/InventoryOutbound/update-outbound-request/${id}/status`,
        payload,
      );
      message.success("Outbound request approved successfully!");
      fetchData();
    } catch (error) {
      console.error("Approval error:", error);
      message.error(error.response?.data?.message || "Approval failed");
    } finally {
      setIsApproving(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin size="large" tip="Loading Outbound Details..." />
      </div>
    );

  if (!data)
    return (
      <div className="p-10 text-center text-slate-400">No data found.</div>
    );

  return (
    <div className="pt-7 px-12 bg-[#F8FAFC] min-h-screen font-sans">
      {/* Header điều hướng và thao tác */}
      <DetailsHeader
        data={data}
        onApprove={handleApprove}
        isApproving={isApproving}
        onExportPDF={() => handlePrint()}
      />

      {/* 1. GIAO DIỆN HIỂN THỊ TRÊN TRÌNH DUYỆT */}
      <div className="mt-8 pb-20">
        <div className="flex justify-center gap-x-6">
          {/* Cột trái: Sản phẩm và Thanh toán */}
          <div className="w-[60%] space-y-6">
            {/* Sử dụng data.items theo JSON Outbound trả về */}
            <div>
              <DetailsProductList items={data.items} />
            </div>
            <DetailsPayment data={data} />
          </div>

          {/* Cột phải: Thông tin Warehouse, Destination, Lý do xuất */}
          <div className="w-[30%] space-y-6">
            <div>
              <DetailsSidebarInfo data={data} />
            </div>
            {/* Sử dụng data.reason cho ghi chú/lý do xuất */}
            <DetailsNotes note={data.reason} />
          </div>
        </div>
      </div>

      {/* 2. PHẦN ẨN: CHỈ HIỂN THỊ KHI IN PDF */}
      <OutboundPrintTemplate ref={printRef} data={data} />
    </div>
  );
};

export default OutboundRequestDetails;
