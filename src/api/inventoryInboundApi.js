import axiosInstance from "./axiosInstance";

// Inbound Requests
export const getInboundRequests = async (companyId) => {
  const response = await axiosInstance.get(`/api/InventoryInbound/requests/${companyId}`);
  return response.data;
};

export const getInboundRequestById = async (companyId, id) => {
  const response = await axiosInstance.get(`/api/InventoryInbound/requests/${companyId}/${id}`);
  return response.data;
};

export const createInboundRequest = async (data) => {
  const response = await axiosInstance.post("/api/InventoryInbound/create-inbound-request", data);
  return response.data;
};

export const updateInboundRequestStatus = async (id, data) => {
  const response = await axiosInstance.put(
    `/api/InventoryInbound/update-inbound-request/${id}/status`,
    data
  );
  return response.data;
};

// Inbound Tickets
export const getInboundTickets = async (companyId) => {
  const response = await axiosInstance.get(`/api/InventoryInbound/tickets/${companyId}`);
  return response.data;
};

export const getInboundTicketById = async (companyId, id) => {
  const response = await axiosInstance.get(`/api/InventoryInbound/tickets/${companyId}/${id}`);
  return response.data;
};

export const createInboundTicket = async (requestId, data) => {
  const response = await axiosInstance.post(
    `/api/InventoryInbound/create-inbound-ticket/${requestId}/tickets`,
    data
  );
  return response.data;
};

export const updateInboundTicketItems = async (ticketId, data) => {
  const response = await axiosInstance.put(
    `/api/InventoryInbound/tickets/${ticketId}/items`,
    data
  );
  return response.data;
};

export const getInboundOrdersForStaff = async (companyId, staffId) => {
  const response = await axiosInstance.get(
    `/api/InventoryInbound/get-inbound-orders-for-staff/${companyId}/${staffId}`
  );
  return response.data;
};

// Export
export const exportInboundRequestCsv = async (requestId) => {
  const response = await axiosInstance.get(
    `/api/InventoryInbound/export/inbound-request/${requestId}/csv`,
    { responseType: "blob" }
  );
  return response.data;
};

export const exportInboundRequestExcel = async (requestId) => {
  const response = await axiosInstance.get(
    `/api/InventoryInbound/export/inbound-request/${requestId}/excel`,
    { responseType: "blob" }
  );
  return response.data;
};

export const exportInboundTicketCsv = async (orderId) => {
  const response = await axiosInstance.get(
    `/api/InventoryInbound/export/inbound-ticket/${orderId}/csv`,
    { responseType: "blob" }
  );
  return response.data;
};

export const exportInboundTicketExcel = async (orderId) => {
  const response = await axiosInstance.get(
    `/api/InventoryInbound/export/inbound-ticket/${orderId}/excel`,
    { responseType: "blob" }
  );
  return response.data;
};
