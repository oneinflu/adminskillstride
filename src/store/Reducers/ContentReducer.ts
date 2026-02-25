import { createSlice } from "@reduxjs/toolkit";

export interface AuthState {
  data: [];
}

const initialState: AuthState = {
  data: [],
};

const AuthSlice = createSlice({
  name: "ContentReducer",
  initialState,
  reducers: {
    managedata: (state, action) => {
    //   console.log(action)
      state.data = action.payload;
    },
  },
});

export const { managedata } = AuthSlice.actions;

export default AuthSlice.reducer;