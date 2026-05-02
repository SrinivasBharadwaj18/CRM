import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchLeads = createAsyncThunk(
  "leads/fetchLeads",
  async () => {
    const res = await api.get("api/agent/leads/");
    return res.data; // This is the [18] items from your console
  }
);

const leadsSlice = createSlice({
  name: "leads",
  initialState: {
    items: [],
    loading: false
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        // BRAINS: We ensure state.items is ALWAYS an array, even if API fails
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchLeads.rejected, (state) => {
        state.loading = false;
        state.items = []; 
      });
  }
});

export default leadsSlice.reducer;