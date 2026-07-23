import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/login/authSlice";
import reviewReducer from "./slices/login/reviewSlice";
import demoFormsReducer from "./slices/login/demoFormSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    review: reviewReducer,
    demoForms:demoFormsReducer,
  },
});

export default store;
