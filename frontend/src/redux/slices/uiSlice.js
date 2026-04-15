import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    cartOpen: false,
    mobileMenuOpen: false,
    theme: 'dark',
  },
  reducers: {
    toggleCart: (state) => { state.cartOpen = !state.cartOpen; },
    setCartOpen: (state, action) => { state.cartOpen = action.payload; },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    toggleTheme: (state) => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; },
  },
});

export const { toggleCart, setCartOpen, toggleMobileMenu, toggleTheme } = uiSlice.actions;
export default uiSlice.reducer;
