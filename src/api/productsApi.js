import axiosInstance from "./axiosInstance";

export const getAllProducts = async (userId) => {
  const response = await axiosInstance.get(`/api/Products/get-all/${userId}`);
  return response.data;
};

export const getProductById = async (userId, id) => {
  const response = await axiosInstance.get(`/api/Products/get-by-id/${userId}/${id}`);
  return response.data;
};

export const getProductBySku = async (userId, sku) => {
  const response = await axiosInstance.get(`/api/Products/get-by-sku/${userId}/sku/${sku}`);
  return response.data;
};

export const createProduct = async (data) => {
  const response = await axiosInstance.post("/api/Products/create", data);
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await axiosInstance.put(`/api/Products/update${id}`, data);
  return response.data;
};

export const deleteProduct = async (userId, id) => {
  const response = await axiosInstance.delete(`/api/Products/delete/${userId}/${id}`);
  return response.data;
};

export const getAllProductTypes = async (userId) => {
  const response = await axiosInstance.get(`/api/Products/get-all-product-types/${userId}`);
  return response.data;
};

export const createProductType = async (data) => {
  const response = await axiosInstance.post("/api/Products/create-new-product-type", data);
  return response.data;
};

export const updateProductTypeName = async (id, data) => {
  const response = await axiosInstance.put(`/api/Products/update-type-name/${id}`, data);
  return response.data;
};

export const deleteProductType = async (id) => {
  const response = await axiosInstance.delete(`/api/Products/delete-product-type/${id}`);
  return response.data;
};

export const importProductsCsv = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post("/api/Products/import/csv", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const importProductsExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post("/api/Products/import/excel", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const exportProductsCsv = async () => {
  const response = await axiosInstance.get("/api/Products/export/csv", {
    responseType: "blob",
  });
  return response.data;
};

export const exportProductsExcel = async () => {
  const response = await axiosInstance.get("/api/Products/export/excel", {
    responseType: "blob",
  });
  return response.data;
};
