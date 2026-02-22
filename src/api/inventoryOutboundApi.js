import axiosInstance from "./axiosInstance";

// Outbound Requests
export const getOutboundRequests = async (companyId) => {
  const response = await axiosInstance.get(`/api/InventoryOutbound/requests/${companyId}`);
  return response.data;
};

export const getOutboundRequestById = async (companyId, id) => {
  const response = await axiosInstance.get(`/api/InventoryOutbound/requests/${companyId}/${id}`);
  return response.data;
};

export const createOutboundRequest = async (data) => {
  const response = await axiosInstance.post("/api/InventoryOutbound/create-outbound-request", data);
  return response.data;
};

export const updateOutboundRequestStatus = async (id, data) => {
  const response = await axiosInstance.put(
    `/api/InventoryOutbound/update-outbound-request/${id}/status`,
    data
  );
  return response.data;
};

// Outbound Tickets
export const getOutboundTickets = async (companyId) => {
  const response = await axiosInstance.get(`/api/InventoryOutbound/tickets/${companyId}`);
  return response.data;
};

export const getOutboundTicketById = async (companyId, id) => {
  const response = await axiosInstance.get(`/api/InventoryOutbound/tickets/${companyId}/${id}`);
  return response.data;
};

export const createOutboundTicket = async (requestId, data) => {
  const response = await axiosInstance.post(
    `/api/InventoryOutbound/create-outbound-ticket/${requestId}/tickets`,
    data
  );
  return response.data;
};

export const updateOutboundTicketItems = async (ticketId, data) => {
  const response = await axiosInstance.put(
    `/api/InventoryOutbound/tickets/${ticketId}/items`,
    data
  );
  return response.data;
};

export const updateOutboundTicketStatus = async (ticketId, data) => {
  const response = await axiosInstance.put(
    `/api/InventoryOutbound/tickets/${ticketId}/status`,
    data
  );
  return response.data;
};

export const confirmOutboundTicket = async (ticketId, data) => {
  const response = await axiosInstance.post(
    `/api/InventoryOutbound/tickets/${ticketId}/confirm`,
    data
  );
  return response.data;
};

export const getOutboundOrdersForStaff = async (companyId, staffId) => {
  const response = await axiosInstance.get(
    `/api/InventoryOutbound/get-outbound-orders-for-staff/${companyId}/${staffId}`
  );
  return response.data;
};

export const checkOutboundAvailability = async (params) => {
  const response = await axiosInstance.get("/api/InventoryOutbound/availability", { params });
  return response.data;
};
