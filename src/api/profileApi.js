import axiosInstance from "./axiosInstance";

export const getProfileApi = async () => {
  const response = await axiosInstance.get("/api/profile");
  return response.data;
};

export const updateProfileApi = async (data) => {
  const response = await axiosInstance.put("/api/profile", {
    adminFullName: data.adminFullName,
    adminPhone: data.adminPhone,
  });
  return response.data;
};

export const updateCompanyApi = async (data) => {
  const response = await axiosInstance.put("/api/companies", {
    companyName: data.companyName,
    businessCode: data.businessCode,
    address: data.address,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
  });
  return response.data;
};

export const uploadAvatarApi = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const response = await axiosInstance.post("/api/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const changePasswordApi = async (data) => {
  const response = await axiosInstance.put("/api/profile/change-password", {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
  });
  return response.data;
};
