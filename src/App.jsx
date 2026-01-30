import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { authorizeRole } from "./utils/utils";

const App = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const roleId = localStorage.getItem("roleId");

  useEffect(() => {
    if (token && roleId) {
      authorizeRole(roleId, navigate);
    }
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default App;
