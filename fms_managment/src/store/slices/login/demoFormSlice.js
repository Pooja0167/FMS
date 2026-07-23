import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../utils/api";

export const fetchDemoForms = createAsyncThunk(
  "demoForms/fetchDemoForms",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(
        "/feedback/demo_form/?select_related=company,person_incharge,country,state,city,creator,updated_by,beverages,demo_member,demo_status",
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Error fetching Ingredients!",
      );
    }
  },
);

export const createDemoForm = createAsyncThunk(
  "demoForms/createDemoForm",
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post("/feedback/demo_form/", formData);
      dispatch(fetchDemoForms());
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

export const updateDemoForm = createAsyncThunk(
  "demoForms/updateDemoForm",
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.put(`/feedback/demo_form/${id}`, formData);
      dispatch(fetchDemoForms());
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

export const deleteDemoForm = createAsyncThunk(
  "demoForms/deleteDemoForm",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.delete(`/feedback/demo_form/${id}`);
      dispatch(fetchDemoForms());
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
// ===============FK======================
export const fetchCompanies = createAsyncThunk(
  "demoForms/fetchCompanies",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/company/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);
export const fetchCountries = createAsyncThunk(
  "demoForms/fetchCountries",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/country/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);
export const fetchStates = createAsyncThunk(
  "demoForms/fetchStates",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/state/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);
export const fetchCities = createAsyncThunk(
  "demoForms/fetchCities",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/city/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);
export const fetchBeverages = createAsyncThunk(
  "demoForms/fetchBeverages",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/beverages/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);
export const fetchCreators = createAsyncThunk(
  "demoForms/fetchCreators",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/people/user/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);
export const fetchDemoMachine = createAsyncThunk(
  "demoForms/fetchDemoMachine",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/inventory/machine_stock/");

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);
export const fetchDemoStatus = createAsyncThunk(
  "demoForms/fetchDemoStatus",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/feedback/demo_status/");

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  },
);
// export const fetchIngredients = createAsyncThunk(
//   "demoForms/fetchIngredients",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await api.get("/inventory/ingredients/");
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data);
//     }
//   },
// );
/* ================= SLICE ================= */
const demoFormSlice = createSlice({
  name: "demoForms",
  initialState: {
    demoForms: [],
    companies: [],
    countries: [],
    states: [],
    cities: [],
    beverages: [],
    creators: [],
    updates: [],
    members: [],
    persons: [],
    demostatus: [],
    demomachines: [],
    // ingredients: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDemoForms.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDemoForms.fulfilled, (state, action) => {
        state.loading = false;
        state.demoForms = action.payload;
      })
      .addCase(fetchDemoForms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.companies = action.payload;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.countries = action.payload;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.states = action.payload;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.cities = action.payload;
      })
      .addCase(fetchBeverages.fulfilled, (state, action) => {
        state.beverages = action.payload;
      })

      .addCase(fetchCreators.fulfilled, (state, action) => {
        state.creators = action.payload;
        state.persons = action.payload;
        state.updates = action.payload;
        state.members = action.payload;
      })
      .addCase(fetchDemoMachine.fulfilled, (state, action) => {
        state.demomachines = action.payload.results || action.payload;
      })
      .addCase(fetchDemoMachine.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchDemoStatus.fulfilled, (state, action) => {
        state.demostatus = action.payload;
      });
  },
});

export default demoFormSlice.reducer;
