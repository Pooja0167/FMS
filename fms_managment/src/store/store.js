import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/login/authSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;
