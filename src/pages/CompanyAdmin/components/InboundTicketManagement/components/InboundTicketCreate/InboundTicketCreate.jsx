import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, message } from "antd";
import api from "../../../../../../api/axios";
import DetailsHeader from "./components/DetailsHeader/DetailsHeader";
import DetailsProductList from "./components/DetailsProductList/DetailsProductList";
import DetailsSidebarInfo from "./components/DetailsSidebarInfo/DetailsSidebarInfo";
import DetailsPayment from "./components/DetailsPayment/DetailsPayment";
import DetailsNotes from "./components/DetailsNotes/DetailsNotes";

const InboundTicketCreate = () => {
  const { id } = useParams(); // requestId từ URL (ví dụ: 53)
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const companyId = localStorage.getItem("companyId");
  const userId = localStorage.getItem("userId");

  // Fetch dữ liệu Request gốc để hiển thị thông tin
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

  // Hàm xử lý gọi API tạo Ticket
  const handleCreateTicket = async () => {
    if (!userId) {
      message.error("User session expired. Please login again.");
      return;
    }

    try {
      setIsCreating(true);
      const payload = {
        createdBy: Number(userId),
        staffId: 1, // Mặc định là 1 theo yêu cầu
      };

      // Gọi API POST tạo ticket
      const res = await api.post(
        `/InventoryInbound/create-inbound-ticket/${id}/tickets`,
        payload,
      );

      if (res.status === 200 || res.status === 201) {
        message.success("Inbound Ticket created successfully!");
        // Điều hướng về trang danh sách ticket sau khi tạo thành công
        navigate("/company-admin/inbound-ticket-management");
      }
    } catch (error) {
      console.error("Create ticket error:", error);
      message.error(error.response?.data?.message || "Failed to create ticket");
    } finally {
      setIsCreating(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin size="large" tip="Loading Request Data..." />
      </div>
    );

  if (!data)
    return <div className="p-10 text-center">No request data found.</div>;

  return (
    <div className="pt-7 px-12 bg-[#F8FAFC] min-h-screen font-sans">
      <DetailsHeader
        data={{ ...data, status: "Approved" }} // Ép trạng thái Approved để hiển thị nút Create Ticket
        onApprove={handleCreateTicket} // Truyền hàm gọi API vào prop onApprove của Header
        isApproving={isCreating} // Hiệu ứng loading cho nút
      />

      <div className="mt-8 pb-20">
        <div className="flex justify-center gap-x-6">
          <div className="w-[60%] space-y-6">
            <div>
              {/* Hiển thị danh sách sản phẩm từ request gốc */}
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

export default InboundTicketCreate;
