import axiosInstance from "./axiosInstance";

export const getAllUsers = async () => {
  const response = await axiosInstance.get("/api/Users");
  return response.data;
};

export const createUser = async (data) => {
  // data: { fullName, email, phone, password, roleName }
  const response = await axiosInstance.post("/api/Users", data);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await axiosInstance.get(`/api/Users/${id}`);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await axiosInstance.put(`/api/Users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`/api/Users/${id}`);
  return response.data;
};

export const getUserProfile = async (userId) => {
  const response = await axiosInstance.get(`/api/Users/get-user-profile/${userId}`);
  return response.data;
};

export const updateUserProfile = async (userId, data) => {
  const response = await axiosInstance.put(`/api/Users/update-profile/${userId}`, data);
  return response.data;
};

export const getUsersByWarehouse = async (warehouseId) => {
  const response = await axiosInstance.get(`/api/Users/get-users-by-warehouse/${warehouseId}`);
  return response.data;
};
