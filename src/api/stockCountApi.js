import axiosInstance from "./axiosInstance";

export const getStockCountTickets = async (params) => {
  const response = await axiosInstance.get("/api/stock-count-tickets", { params });
  return response.data;
};

export const createStockCountTicket = async (data) => {
  const response = await axiosInstance.post("/api/stock-count-tickets", data);
  return response.data;
};

export const getStockCountTicketById = async (ticketId) => {
  const response = await axiosInstance.get(`/api/stock-count-tickets/${ticketId}`);
  return response.data;
};

export const runStockCount = async (ticketId) => {
  const response = await axiosInstance.post(`/api/stock-count-tickets/${ticketId}/run`);
  return response.data;
};

export const approveStockCount = async (ticketId) => {
  const response = await axiosInstance.post(`/api/stock-count-tickets/${ticketId}/approve`);
  return response.data;
};

export const getInventoryProductsByWarehouse = async (warehouseId) => {
  const response = await axiosInstance.get(
    `/api/stock-count-tickets/warehouses/${warehouseId}/inventory-products`
  );
  return response.data;
};

export const updateStockCountItem = async (itemId, data) => {
  const response = await axiosInstance.patch(`/api/stock-count-items/${itemId}`, data);
  return response.data;
};
