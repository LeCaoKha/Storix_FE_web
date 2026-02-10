import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Spin, message } from "antd";
import api from "../../../../../../api/axios";
import DetailsHeader from "./components/DetailsHeader/DetailsHeader";
import DetailsProductList from "./components/DetailsProductList/DetailsProductList";
import DetailsSidebarInfo from "./components/DetailsSidebarInfo/DetailsSidebarInfo";
import DetailsPayment from "./components/DetailsPayment/DetailsPayment";
import DetailsNotes from "./components/DetailsNotes/DetailsNotes";
import { useReactToPrint } from "react-to-print"; // Import mới
const InboundRequestDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

  const contentRef = useRef(null); // Tạo ref để trỏ vào vùng nội dung

  const companyId = localStorage.getItem("companyId");
  const userId = localStorage.getItem("userId");

  // Hàm xử lý Export PDF
  const handlePrint = useReactToPrint({
    contentRef: contentRef, // Version 3 yêu cầu key này
    documentTitle: `Inbound_Request_${data?.code || id}`,
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

      // API PUT theo yêu cầu mới
      await api.put(
        `/InventoryInbound/update-inbound-request/${id}/status`,
        payload,
      );

      message.success("Request approved successfully!");
      fetchData(); // Reload lại dữ liệu để cập nhật trạng thái mới
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

  if (!data) return <div className="p-10 text-center">No data found.</div>;

  return (
    <div className="pt-7 px-12 bg-[#F8FAFC] min-h-screen font-sans">
      {/* Truyền hàm handleExportPDF vào Header */}
      <DetailsHeader
        data={data}
        onApprove={handleApprove}
        isApproving={isApproving}
        onExportPDF={handlePrint} // Gắn hàm in mới vào đây
      />

      {/* Bao bọc vùng cần in bằng contentRef */}
      <div ref={contentRef} className="mt-8 pb-20">
        <div className="flex justify-center gap-x-6">
          <div className="w-[60%] space-y-6">
            <div>
              <DetailsProductList items={data.inboundOrderItems} />
            </div>
            <div>
              <DetailsPayment data={data} />
            </div>
          </div>

          <div className="w-[30%] space-y-6">
            <DetailsSidebarInfo data={data} />
            <DetailsNotes note={data.note} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboundRequestDetails;
