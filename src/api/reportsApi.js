import axiosInstance from "./axiosInstance";

export const getReports = async (params) => {
  const response = await axiosInstance.get("/api/Reports", { params });
  return response.data;
};

export const createReport = async (data) => {
  const response = await axiosInstance.post("/api/Reports", data);
  return response.data;
};

export const getReportById = async (id) => {
  const response = await axiosInstance.get(`/api/Reports/${id}`);
  return response.data;
};

export const exportReportPdf = async (id) => {
  const response = await axiosInstance.post(`/api/Reports/${id}/export/pdf`, null, {
    responseType: "blob",
  });
  return response.data;
};
