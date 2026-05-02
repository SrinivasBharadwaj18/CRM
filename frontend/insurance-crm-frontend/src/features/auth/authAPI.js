import axiosInstance from "../../services/axiosInstance";

// LOGIN API
export const loginAPI = async (data) => {
  const response = await axiosInstance.post("user/login", data);
  return response.data;
};

// CREATE AGENT API
export const createAgentAPI = async (data) => {
  const response = await axiosInstance.post("admin/create-user", data);
  return response.data;
};