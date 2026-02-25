import { combineReducers } from "@reduxjs/toolkit";
import AuthReducer from "./AuthReducer";
import AuthTest from "./AuthTest";
import ContentReducer from "./ContentReducer";
// import storage from "redux-persist/es/storage";
import persistReducer from "redux-persist/es/persistReducer";
import storage from "redux-persist/lib/storage";

// const rootReducer = combineReducers({
//   auth: authReducer,
//   devTools: process.env.NODE_ENV !== "production",
//   middleware: [thunk],
// });

// export type RootState = ReturnType<typeof rootReducer>;
// export default rootReducer;

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["AuthReducer", "AuthTest"],
};

const reducers = combineReducers({
  AuthReducer,
  AuthTest,
  ContentReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === "LOGOUT") {
    storage.removeItem("persist:root");
    window.location.reload();
    return reducers(undefined, action);
  }
  return reducers(state, action);
};

export default persistReducer(persistConfig, rootReducer);
