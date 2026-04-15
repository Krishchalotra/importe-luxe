import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/wishlist');
    return res.data.data.wishlist;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/wishlist/${productId}`);
    return { productId, isWishlisted: res.data.data.isWishlisted };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { productId, isWishlisted } = action.payload;
        if (isWishlisted) {
          // Will be refreshed on next fetch; optimistic update not needed here
        } else {
          state.items = state.items.filter((item) => item._id !== productId);
        }
      });
  },
});

export const selectWishlistIds = (state) => state.wishlist.items.map((i) => i._id);
export default wishlistSlice.reducer;
