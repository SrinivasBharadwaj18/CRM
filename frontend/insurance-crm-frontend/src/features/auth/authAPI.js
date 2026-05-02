import axiosInstance from "../../services/axiosInstance";

// LOGIN API
export const loginAPI = async (data) => {
  const response = await axiosInstance.post("api/user/login", data);
  return response.data;
};

// CREATE AGENT API
export const createAgentAPI = async (data) => {
  const response = await axiosInstance.post("api/admin/create-user", data);
  return response.data;
};