import axiosInstance from "./axiosInstance";

export const loginApi = async ({ email, password }) => {
  const response = await axiosInstance.post("/Login", { email, password });
  return response.data;
};

export const registerCompanyApi = async (data) => {
  const payload = {
    companyName: data.companyName || "",
    businessCode: data.businessCode || "",
    address: data.address || "",
    contactEmail: data.contactEmail || "",
    contactPhone: data.contactPhone || "",
    adminFullName: data.adminFullName,
    adminEmail: data.adminEmail,
    adminPhone: data.adminPhone,
    password: data.password,
  };
  const response = await axiosInstance.post("/api/Companies/register", payload);
  return response.data;
};

export const signupApi = async (data) => {
  const payload = {
    fullName: data.fullName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    password: data.password,
    address: data.address || "",
    companyCode: data.companyCode || "",
  };
  const response = await axiosInstance.post("/Signup", payload);
  return response.data;
};

export const logoutApi = async (refreshToken) => {
  const response = await axiosInstance.post("/logout", { refreshToken });
  return response.data;
};

export const refreshTokenApi = async (refreshToken) => {
  const response = await axiosInstance.post("/refresh", { refreshToken });
  return response.data;
};

export const forgotPasswordApi = async ({ email }) => {
  const response = await axiosInstance.post("/api/auth/forgot-password", { email });
  return response.data;
};
