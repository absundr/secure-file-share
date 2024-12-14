import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: !!Cookies.get("token"),
    token: Cookies.get("token") || null,
    user: null,
  },
  reducers: {
    login(state, action) {
      state.isLoggedIn = true;
      state.token = action.payload.token;
      Cookies.set("token", action.payload.token, {
        expires: new Date(action.payload.expiry),
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    },
    logout(state) {
      state.isLoggedIn = false;
      state.token = null;
      state.user = null;
      Cookies.remove("token");
    },
    user(state, action) {
      state.user = action.payload;
    },
  },
});

export const { login, logout, user } = authSlice.actions;
export default authSlice.reducer;
