import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params = {}) => {
    const response = await axios.get(`${API_URL}/products`, { params });
    return response.data.data;
  }
);

export const fetchProductBySlug = createAsyncThunk(
  'products/fetchBySlug',
  async (slug) => {
    const response = await axios.get(`${API_URL}/products/slug/${slug}`);
    return response.data.data;
  }
);

export const fetchVendorProducts = createAsyncThunk(
  'products/fetchVendor',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/products/vendor/myproducts`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (productData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(`${API_URL}/products`, productData, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, productData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await axios.put(`${API_URL}/products/${id}`, productData, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    vendorProducts: [],
    currentProduct: null,
    isLoading: false,
    error: null
  },
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Fetch product by slug
      .addCase(fetchProductBySlug.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Fetch vendor products
      .addCase(fetchVendorProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchVendorProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vendorProducts = action.payload;
      })
      .addCase(fetchVendorProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.vendorProducts.unshift(action.payload);
      })
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.vendorProducts.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.vendorProducts[index] = action.payload;
        }
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.vendorProducts = state.vendorProducts.filter(p => p._id !== action.payload);
      });
  }
});

export const { clearProductError } = productSlice.actions;
export default productSlice.reducer;