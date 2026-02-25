import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  data: [];
}

const initialState: AuthState = {
  data: [],
};

const AuthSlice = createSlice({
  name: "AuthTest",
  initialState,
  reducers: {
    mamagedata: (state, action) => {
      state.data = action.payload;
    }
  },
});

export const { mamagedata } = AuthSlice.actions;

export default AuthSlice.reducer;
