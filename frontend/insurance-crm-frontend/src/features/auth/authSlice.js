import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { loginAPI } from "./authAPI";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (data, thunkAPI) => {
    try {
      return await loginAPI(data);
    } catch (error) {
      const message = error.response?.data || "Login failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    // This inline check prevents the ReferenceError and the JSON.parse error
    user: (localStorage.getItem("user") && localStorage.getItem("user") !== "undefined") 
      ? JSON.parse(localStorage.getItem("user")) 
      : null,
    access: localStorage.getItem("access") || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("access");
      localStorage.removeItem("user");
      state.access = null;
      state.user = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        // Verify these keys match what your Django Login view returns
        state.access = action.payload.access; 
        state.user = action.payload.user; 

        localStorage.setItem("access", action.payload.access);
        localStorage.setItem("refresh",action.payload.refresh)
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;