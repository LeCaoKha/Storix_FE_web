import axiosInstance from "./axiosInstance";

export const getWarehousesByCompany = async (companyId) => {
  const response = await axiosInstance.get(`/api/company-warehouses/${companyId}/warehouses`);
  return response.data;
};

export const getWarehouseAssignments = async (companyId) => {
  const response = await axiosInstance.get(`/api/company-warehouses/${companyId}/assignments`);
  return response.data;
};

export const assignWarehouse = async (companyId, data) => {
  // data: AssignWarehouseRequest
  const response = await axiosInstance.post(`/api/company-warehouses/${companyId}/assignments`, data);
  return response.data;
};

export const removeWarehouseAssignment = async (companyId, data) => {
  const response = await axiosInstance.delete(`/api/company-warehouses/${companyId}/assignments`, { data });
  return response.data;
};

export const getAssignmentByWarehouse = async (companyId, warehouseId) => {
  const response = await axiosInstance.get(
    `/api/company-warehouses/${companyId}/assignments/warehouse/${warehouseId}`
  );
  return response.data;
};
