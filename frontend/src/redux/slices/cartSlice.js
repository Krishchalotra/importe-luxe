import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    shippingAddress: null,
    paymentMethod: 'stripe',
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((item) => item.product._id === product._id);

      if (existing) {
        const newQty = existing.quantity + quantity;
        existing.quantity = Math.min(newQty, product.stock);
      } else {
        state.items.push({ product, quantity: Math.min(quantity, product.stock) });
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.product._id !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.product._id === productId);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i.product._id !== productId);
        } else {
          item.quantity = Math.min(quantity, item.product.stock);
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    setShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
  },
});

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) =>
  state.cart.items.reduce(
    (sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity,
    0
  );
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const { addToCart, removeFromCart, updateQuantity, clearCart, setShippingAddress, setPaymentMethod } =
  cartSlice.actions;
export default cartSlice.reducer;
