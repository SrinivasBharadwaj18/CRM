import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Add this!
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App"; // Point to App.jsx

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter> 
        <App /> 
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);