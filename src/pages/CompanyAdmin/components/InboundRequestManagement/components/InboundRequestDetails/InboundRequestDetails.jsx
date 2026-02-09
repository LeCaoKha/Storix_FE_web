import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Spin, message } from "antd";
import api from "../../../../../../api/axios"; // Đảm bảo đường dẫn tới file config api của bạn đúng
import DetailsHeader from "./components/DetailsHeader/DetailsHeader";
import DetailsProductList from "./components/DetailsProductList/DetailsProductList";
import DetailsSidebarInfo from "./components/DetailsSidebarInfo/DetailsSidebarInfo";
import DetailsPayment from "./components/DetailsPayment/DetailsPayment";
import DetailsNotes from "./components/DetailsNotes/DetailsNotes";

const InboundRequestDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const companyId = localStorage.getItem("companyId");

  const fetchData = async () => {
    try {
      setLoading(true);
      // Sử dụng cú pháp api.get như bạn yêu cầu
      const res = await api.get(
        `/InventoryInbound/requests/${companyId}/${id}`,
      );

      // Axios thường trả về dữ liệu trong res.data
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
    try {
      // Ví dụ call API approve
      await api.post(`/InventoryInbound/approve/${id}`);
      message.success("Request approved successfully!");
      fetchData(); // Load lại dữ liệu mới
    } catch (error) {
      message.error("Approval failed");
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
    <div className="p-8 bg-[#f8f9fa] min-h-screen">
      <DetailsHeader data={data} onApprove={handleApprove} />

      <Row gutter={[24, 24]} className="mt-8">
        {/* Left Column - 70% */}
        <Col span={16}>
          <div className="flex flex-col gap-6">
            <DetailsProductList items={data.inboundOrderItems} />
            <DetailsPayment data={data} />
          </div>
        </Col>

        {/* Right Column - 30% */}
        <Col span={8}>
          <div className="flex flex-col gap-6">
            <DetailsSidebarInfo data={data} />
            <DetailsNotes note={data.note} />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default InboundRequestDetails;
