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
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]); // Danh sách nhân viên
  const [selectedStaffId, setSelectedStaffId] = useState(null); // ID nhân viên được chọn
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const companyId = localStorage.getItem("companyId");
  const userId = localStorage.getItem("userId");

  const fetchData = async () => {
    try {
      setLoading(true);
      // Gọi song song cả API lấy Request và API lấy danh sách User
      const [requestRes, usersRes] = await Promise.all([
        api.get(`/InventoryInbound/requests/${companyId}/${id}`),
        api.get(`/Users`), // API lấy danh sách user
      ]);

      setData(requestRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && companyId) {
      fetchData();
    }
  }, [id, companyId]);

  const handleCreateTicket = async () => {
    if (!userId) {
      message.error("User session expired. Please login again.");
      return;
    }

    if (!selectedStaffId) {
      message.warning("Please select a staff member to handle this ticket.");
      return;
    }

    try {
      setIsCreating(true);
      const payload = {
        createdBy: Number(userId),
        staffId: selectedStaffId, // Sử dụng giá trị từ Select
      };

      const res = await api.post(
        `/InventoryInbound/create-inbound-ticket/${id}/tickets`,
        payload,
      );

      if (res.status === 200 || res.status === 201) {
        message.success("Inbound Ticket created successfully!");
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

  return (
    <div className="pt-7 px-12 bg-[#F8FAFC] min-h-screen font-sans">
      <DetailsHeader
        data={{ ...data, status: "Approved" }}
        onApprove={handleCreateTicket}
        isApproving={isCreating}
      />

      <div className="mt-8 pb-20">
        <div className="flex justify-center gap-x-6">
          <div className="w-[60%] space-y-6">
            <div>
              <DetailsProductList items={data?.inboundOrderItems} />
            </div>
            <div>
              <DetailsPayment data={data} />
            </div>
          </div>

          <div className="w-[30%] space-y-6">
            <DetailsSidebarInfo
              data={data}
              users={users}
              selectedStaffId={selectedStaffId}
              onStaffChange={setSelectedStaffId}
            />
            <DetailsNotes note={data.note} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboundTicketCreate;
