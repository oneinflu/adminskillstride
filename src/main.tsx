import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import AppRoutes from "./AppRoutes";
import { PersistGate } from "redux-persist/integration/react";
import './index.css'
import { store, persistor } from "./store/store";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
     <PersistGate loading={null} persistor={persistor}>
      <AppRoutes />
    </PersistGate>
  </Provider>,
)
