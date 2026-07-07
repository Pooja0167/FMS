import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../utils/api";
import Cookies from "js-cookie";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const requestBody = {
        username,
        password,
      };

      const response = await api.post("/access/login/", requestBody);

      if (response.status !== 200 && response.status !== 201) {
        return rejectWithValue("Login failed. Please try again.");
      }

      const { access, refresh, username: uname, position } = response.data;

      Cookies.set("access_token", access, { expires: 1 });
      Cookies.set("refresh_token", refresh, { expires: 1 });
      Cookies.set("username", uname, { expires: 1 });
      Cookies.set("position", position, { expires: 1 });

      return {
        access,
        refresh,
        username: uname,
        position,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          error.response?.data?.non_field_errors?.[0] ||
          "Invalid username or password"
      );
    }
  }
);

const initialState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.loading = false;
      state.error = null;

      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      Cookies.remove("username");
      Cookies.remove("position");
    },

    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;