import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../utils/api";

export const fetchcReview = createAsyncThunk(
  "review/fetchcReview",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/feedback/reviews/?select_related=demo");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching Review!");
    }
  },
);

export const createReview = createAsyncThunk(
  "review/createReview",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/feedback/reviews/", formData);
      dispatch(fetchcReview());
      return {
        data: res.data,
        status: res.status,
      };
    } catch (err) {
      return rejectWithValue({
        data: err.response?.data,
        status: err.response?.status,
      });
    }
  },
);

export const updateReview = createAsyncThunk(
  "review/updateReview",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/feedback/reviews/${id}`, formData);
      dispatch(fetchcReview());
      return {
        id,
        data: res.data,
        status: res.status,
      };
    } catch (err) {
      return rejectWithValue({
        data: err.response?.data,
        status: err.response?.status,
      });
    }
  },
);

export const deleteReview = createAsyncThunk(
  "review/deleteReview",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/feedback/reviews/${id}`);
      dispatch(fetchcReview());
      return {
        id,
        status: res.status,
      };
    } catch (err) {
      return rejectWithValue({
        data: err.response?.data,
        status: err.response?.status,
      });
    }
  },
);
// ===============FK==================*/
export const fetchDemoForm = createAsyncThunk(
  "review/fetchDemoForm",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/feedback/demo_form/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

// NOTE: this previously hit the same "/feedback/demo_form/" endpoint as
// fetchDemoForm above, which looked like a copy-paste bug rather than an
// intentional duplicate. If you actually have a demo-status endpoint
// (e.g. "/feedback/demo_status/"), point this at that instead.
export const fetchStatus = createAsyncThunk(
  "review/fetchStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/feedback/demo_form/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);

/* ================= SLICE ================= */
const reviewSlice = createSlice({
  name: "review",
  initialState: {
    review: [],
    demoforms: [],
    loading: false,
    error: null,
    // Tracks the in-flight "submit review" call separately from the list
    // fetch above, so the Feedback screen can show its own submitting state
    // (e.g. useSelector((state) => state.review.submitting)).
    submitting: false,
    submitError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchcReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchcReview.fulfilled, (state, action) => {
        state.loading = false;
        state.review = action.payload;
      })
      .addCase(fetchcReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDemoForm.fulfilled, (state, action) => {
        state.demoforms = action.payload;
      })
      .addCase(createReview.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(createReview.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
      });
  },
});

export default reviewSlice.reducer;