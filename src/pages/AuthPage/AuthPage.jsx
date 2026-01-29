import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import LoginComponent from "./components/LoginComponent";
import RegisterComponent from "./components/RegisterComponent";

const AuthPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ===== SOURCE OF TRUTH =====
  const status = searchParams.get("mode") === "signUp" ? "signUp" : "signIn";

  const setMode = (mode) => {
    setSearchParams({ mode });
  };

  // ===== FORM STATE =====
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    storeName: "",
    phone: "",
    city: "",
  });

  const handleChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const speed = "duration-500";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="relative w-full max-w-[850px] h-[550px] bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        {/* ==================== SIGN IN ==================== */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 flex flex-col items-center justify-center px-12 transition-all ${speed} ease-in-out
          ${
            status === "signUp"
              ? "translate-x-full opacity-0 z-10"
              : "translate-x-0 opacity-100 z-20"
          }`}
        >
          <h2 className="text-3xl font-bold mb-3 text-gray-800">Sign In</h2>
          <LoginComponent form={form} handleChange={handleChange} />
        </div>

        {/* ==================== SIGN UP ==================== */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 flex flex-col items-center justify-center px-12 transition-all ${speed} ease-in-out
          ${
            status === "signUp"
              ? "translate-x-full opacity-100 z-20"
              : "translate-x-0 opacity-0 z-10"
          }`}
        >
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Create Account
          </h2>
          <RegisterComponent
            form={form}
            handleChange={handleChange}
            setForm={setForm}
          />
        </div>

        {/* ==================== OVERLAY ==================== */}
        <div
          className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)]
          transition-all ${speed} ease-in-out overflow-hidden z-[100]
          ${
            status === "signUp"
              ? "translate-x-0 rounded-l-2xl rounded-r-[150px]"
              : "translate-x-full rounded-r-2xl rounded-l-[150px]"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[#399EC6]" />

          <div className="relative h-full flex items-center justify-center text-white px-12 text-center">
            {/* ===== HELLO FRIEND ===== */}
            <div
              className={`absolute transition-all ${speed} ease-in-out w-full px-12
              ${
                status === "signUp"
                  ? "translate-x-[120%] opacity-0"
                  : "translate-x-0 opacity-100"
              }`}
            >
              <h2 className="text-3xl font-bold mb-4">Hello, Friend!</h2>
              <p className="text-sm mb-8 opacity-90">
                Enter your personal details and start journey with us
              </p>
              <button
                onClick={() => setMode("signUp")}
                className="border border-white px-12 py-3 rounded-full hover:bg-white hover:text-[var(--color-primary)] transition-all cursor-pointer"
              >
                SIGN UP
              </button>
            </div>

            {/* ===== WELCOME BACK ===== */}
            <div
              className={`absolute transition-all ${speed} ease-in-out w-full px-12
              ${
                status === "signUp"
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-[120%] opacity-0"
              }`}
            >
              <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
              <p className="text-sm mb-8 opacity-90">
                Please login with your personal info
              </p>
              <button
                onClick={() => setMode("signIn")}
                className="border border-white px-12 py-3 rounded-full hover:bg-white hover:text-[var(--color-primary)] transition-all cursor-pointer"
              >
                SIGN IN
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
