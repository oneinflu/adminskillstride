import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  status: boolean;
  userData: any;
}

const initialState: AuthState = {
  status: false,
  userData: {},
};

const AuthSlice = createSlice({
  name: "AuthReducer",
  initialState,
  reducers: {
    login: (state, action) => {
      state.status = true;
      state.userData = action.payload;
    },
    logout: (state) => {
      state.status = false;
      state.userData = {};
    },
    updateProfile: (state, action) => {
      state.userData = {
        ...state.userData,
        user_name: action.payload.user_name,
        profile_picture: action.payload.profile_picture,
      };
    },
    updateAccessToken: (state, action: PayloadAction<{ newToken: string, newRefreshToken: string  }>) => {
      state.userData = {
        ...(state.userData || {}),
        accessToken: action.payload.newToken,
        refreshToken: action.payload.newRefreshToken,
      };
    },
  },
});

export const { login, logout, updateProfile, updateAccessToken } = AuthSlice.actions;

export default AuthSlice.reducer;
