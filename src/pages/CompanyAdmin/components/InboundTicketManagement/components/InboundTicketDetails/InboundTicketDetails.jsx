import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, message } from "antd";
import api from "../../../../../../api/axios";
import DetailsHeader from "../InboundTicketCreate/components/DetailsHeader/DetailsHeader";
import DetailsProductList from "../InboundTicketCreate/components/DetailsProductList/DetailsProductList";
import DetailsSidebarInfo from "../InboundTicketCreate/components/DetailsSidebarInfo/DetailsSidebarInfo";
import DetailsPayment from "../InboundTicketCreate/components/DetailsPayment/DetailsPayment";
import DetailsNotes from "../InboundTicketCreate/components/DetailsNotes/DetailsNotes";

const InboundTicketDetails = () => {
  const { id } = useParams(); // Ticket ID từ URL
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  console.log("in ticket: ", data);

  const companyId = localStorage.getItem("companyId");
  const userId = localStorage.getItem("userId");

  const fetchData = async () => {
    try {
      setLoading(true);
      // Gọi API lấy Ticket chi tiết và danh sách User
      const [ticketRes, usersRes] = await Promise.all([
        api.get(`/InventoryInbound/tickets/${companyId}/${id}`),
        api.get(`/Users`),
      ]);

      const ticketData = ticketRes.data;
      setData(ticketData);
      setUsers(usersRes.data);

      // Tự động gán nhân viên đang phụ trách từ Ticket vào Select
      if (ticketData.staffId) {
        setSelectedStaffId(ticketData.staffId);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && companyId) {
      fetchData();
    }
  }, [id, companyId]);

  // Giả sử nút ở Header dùng để cập nhật lại nhân viên hoặc trạng thái
  const handleUpdateTicket = async () => {
    if (!selectedStaffId) {
      message.warning("Please select a staff member.");
      return;
    }

    try {
      setIsUpdating(true);
      const payload = {
        staffId: selectedStaffId,
        // Có thể thêm các field khác cần update tại đây
      };

      // Giả sử có API update trạng thái hoặc nhân viên cho Ticket
      await api.put(`/InventoryInbound/update-ticket/${id}`, payload);
      message.success("Ticket updated successfully!");
      fetchData();
    } catch (error) {
      message.error("Failed to update ticket");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin size="large" tip="Loading Ticket Details..." />
      </div>
    );

  if (!data) return <div className="p-10 text-center">Ticket not found.</div>;

  return (
    <div className="pt-7 px-12 bg-[#F8FAFC] min-h-screen font-sans">
      <DetailsHeader
        // Hiển thị mã Reference Code thay vì mã ID
        data={{ ...data, code: data.referenceCode }}
        onApprove={handleUpdateTicket}
        isApproving={isUpdating}
      />

      <div className="mt-8 pb-20">
        <div className="flex justify-center gap-x-6">
          {/* Cột trái: Danh sách sản phẩm & Thanh toán */}
          <div className="w-[60%] space-y-6">
            <DetailsProductList items={data.inboundOrderItems} />
            <DetailsPayment data={data} />
          </div>

          {/* Cột phải: Sidebar thông tin người phụ trách & Warehouse */}
          <div className="w-[30%] space-y-6">
            <DetailsSidebarInfo
              data={data}
              users={users}
              selectedStaffId={selectedStaffId}
              onStaffChange={setSelectedStaffId}
            />
            {/* Nếu API Ticket không trả về Note, có thể lấy từ Request hoặc để trống */}
            <DetailsNotes
              note={data.note || "No notes available for this ticket."}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboundTicketDetails;
