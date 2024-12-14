import React from "react";
import { Provider } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import HomePage from "./pages/HomePage";
import RevokePage from "./pages/RevokePage";
import SharedPage from "./pages/SharedPage";
import SecureLayout from "./secure-layout";
import store from "./store";

const App: React.FC = () => (
  <Provider store={store}>
    <Router>
      <Toaster />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<SecureLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shared" element={<SharedPage />} />
          <Route path="/revoke" element={<RevokePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </Router>
  </Provider>
);

export default App;
