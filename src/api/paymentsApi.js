import axiosInstance from "./axiosInstance";

export const createPayment = async (data) => {
  // data: CreatePaymentRequest
  const response = await axiosInstance.post("/api/payments", data);
  return response.data;
};

export const getPaymentStatus = async (params) => {
  const response = await axiosInstance.get("/api/payments/status", { params });
  return response.data;
};

export const createMomoAtmUrl = async (id, data) => {
  const response = await axiosInstance.post(`/api/payments/${id}/momo/atm-url`, data);
  return response.data;
};

export const confirmPaymentSuccess = async (id) => {
  const response = await axiosInstance.put(`/api/payments/${id}/success`);
  return response.data;
};
