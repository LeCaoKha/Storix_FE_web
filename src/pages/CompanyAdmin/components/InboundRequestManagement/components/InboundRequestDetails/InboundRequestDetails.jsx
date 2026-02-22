import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Spin, message } from "antd";
import { useReactToPrint } from "react-to-print";
import api from "../../../../../../api/axios";

// Components
import DetailsHeader from "./components/DetailsHeader/DetailsHeader";
import DetailsProductList from "./components/DetailsProductList/DetailsProductList";
import DetailsSidebarInfo from "./components/DetailsSidebarInfo/DetailsSidebarInfo";
import DetailsPayment from "./components/DetailsPayment/DetailsPayment";
import DetailsNotes from "./components/DetailsNotes/DetailsNotes";
import InboundPrintTemplate from "./components/InboundPrintTemplate/InboundPrintTemplate";

const InboundRequestDetails = () => {
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
    documentTitle: `Inbound_Order_${data?.code || id}`,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/InventoryInbound/requests/${companyId}/${id}`,
      );
      setData(res.data);
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to load request details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && companyId) {
      fetchData();
    }
  }, [id, companyId]);

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

      await api.put(
        `/InventoryInbound/update-inbound-request/${id}/status`,
        payload,
      );
      message.success("Request approved successfully!");
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
        <Spin size="large" tip="Loading Details..." />
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
            <DetailsProductList items={data.inboundOrderItems} />
            <DetailsPayment data={data} />
          </div>

          {/* Cột phải: Thông tin Warehouse, Supplier, Note */}
          <div className="w-[30%] space-y-6">
            <DetailsSidebarInfo data={data} />
            <DetailsNotes note={data.note} />
          </div>
        </div>
      </div>

      {/* 2. PHẦN ẨN: CHỈ HIỂN THỊ KHI IN PDF */}
      <InboundPrintTemplate ref={printRef} data={data} />
    </div>
  );
};

export default InboundRequestDetails;
