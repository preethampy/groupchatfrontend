import {configureStore } from "@reduxjs/toolkit";
import authSlice from "../features/authSlice";
import groupsSlice from "../features/groupsSlice";

export default configureStore({ reducer: { auth: authSlice,groups:groupsSlice } });