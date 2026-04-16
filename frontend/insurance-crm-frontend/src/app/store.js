import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import leadsReducer from "../features/leads/leadSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,      // Keeps track of the logged-in Agent/Admin
    leads: leadsReducer,    // Manages the Lead List and filtering
    dashboard: dashboardReducer, // Manages Sarah's Dashboard metrics
  },
});

export default store;