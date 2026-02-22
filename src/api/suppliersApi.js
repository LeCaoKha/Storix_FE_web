import axiosInstance from "./axiosInstance";

export const getAllSuppliers = async (userId) => {
  const response = await axiosInstance.get(`/api/Suppliers/get-all/${userId}`);
  return response.data;
};

export const getSupplierById = async (userId, id) => {
  const response = await axiosInstance.get(`/api/Suppliers/get-by-id/${userId}/${id}`);
  return response.data;
};

export const createSupplier = async (data) => {
  // data: { companyId, name, contactPerson, email, phone, address }
  const response = await axiosInstance.post("/api/Suppliers/create", data);
  return response.data;
};

export const updateSupplier = async (id, data) => {
  const response = await axiosInstance.put(`/api/Suppliers/update/${id}`, data);
  return response.data;
};

export const deleteSupplier = async (userId, id) => {
  const response = await axiosInstance.delete(`/api/Suppliers/delete/${userId}/${id}`);
  return response.data;
};
