import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { authorizeRole } from "./utils/utils";
import ScrollToTop from "./components/ScrollToTop";

const App = () => {
  // const navigate = useNavigate();

  // const token = localStorage.getItem("accessToken");
  // const roleId = localStorage.getItem("roleId");

  // useEffect(() => {
  //   if (token && roleId) {
  //     authorizeRole(roleId, navigate);
  //   }
  // }, []);
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default App;
