import React, { useState } from "react";

const AuthPage = () => {
  const [status, setStatus] = useState("signIn");

  const handleToggle = () => {
    setStatus(status === "signIn" ? "signUp" : "signIn");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="relative w-full max-w-[850px] h-[550px] bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        {/* ==================== 1. FORM SIGN IN (BÊN TRÁI) ==================== */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 flex flex-col items-center justify-center px-12 transition-all duration-500 ease-in-out z-20
          ${status === "signUp" ? "translate-x-full opacity-0 z-10" : "translate-x-0 opacity-100 z-20"}`}
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Sign In</h2>
          <div className="flex gap-3 mb-5">
            <div className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-50 cursor-pointer">
              f
            </div>
            <div className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-50 cursor-pointer">
              G+
            </div>
            <div className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-50 cursor-pointer">
              in
            </div>
          </div>
          <span className="text-sm text-gray-500 mb-4">
            or use your account
          </span>
          <div className="w-full space-y-3">
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-gray-100 p-3 rounded-lg outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-gray-100 p-3 rounded-lg outline-none"
            />
            <p className="text-sm text-gray-400 text-center cursor-pointer hover:underline">
              Forgot your password?
            </p>
            <button className="w-full py-3 mt-4 bg-[var(--color-primary)] text-white rounded-full font-bold hover:bg-[#2fb1b1] transition-colors">
              SIGN IN
            </button>
          </div>
        </div>

        {/* ==================== 2. FORM SIGN UP (BÊN PHẢI) ==================== */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 flex flex-col items-center justify-center px-12 transition-all duration-500 ease-in-out
          ${status === "signUp" ? "translate-x-full opacity-100 z-20" : "translate-x-0 opacity-0 z-10"}`}
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Create Account
          </h2>
          <div className="flex gap-3 mb-5">
            <div className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-50 cursor-pointer">
              f
            </div>
            <div className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-50 cursor-pointer">
              G+
            </div>
            <div className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-50 cursor-pointer">
              in
            </div>
          </div>
          <span className="text-sm text-gray-500 mb-4">
            or use your email for registration
          </span>
          <div className="w-full space-y-3">
            <input
              type="text"
              placeholder="Name"
              className="w-full bg-gray-100 p-3 rounded-lg outline-none"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-gray-100 p-3 rounded-lg outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-gray-100 p-3 rounded-lg outline-none"
            />
            <button className="w-full py-3 mt-4 bg-[#2fb1b1] text-white rounded-full font-bold hover:bg-[var(--color-primary)] transition-colors">
              SIGN UP
            </button>
          </div>
        </div>

        {/* ==================== 3. TẤM NỀN OVERLAY (DI CHUYỂN) ==================== */}
        <div
          className={`absolute top-0 left-1/2 w-1/2 h-full transition-all duration-500 ease-in-out overflow-hidden z-[100]
          ${status === "signUp" ? "-translate-x-full rounded-r-[150px] rounded-l-none" : "rounded-l-[150px] rounded-r-none"}`}
        >
          {/* Lớp màu nền (mượt mà) */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[#2fb1b1] transition-opacity duration-500" />
          <div
            className={`absolute inset-0 bg-gradient-to-r from-[#2fb1b1] to-[var(--color-primary)] transition-opacity duration-500 ${status === "signUp" ? "opacity-100" : "opacity-0"}`}
          />

          {/* Nội dung bên trong tấm nền */}
          <div className="relative h-full flex items-center justify-center text-white px-12 text-center">
            {/* Khối chữ Hello Friend */}
            <div
              className={`absolute transition-all duration-500 w-full px-12 ${status === "signUp" ? "translate-x-[150%] opacity-0" : "translate-x-0 opacity-100"}`}
            >
              <h2 className="text-3xl font-bold mb-4">Hello, Friend!</h2>
              <p className="text-sm mb-8 opacity-90">
                Enter your personal details and start journey with us
              </p>
              <button
                onClick={handleToggle}
                className="border-1 border-white px-12 py-3 rounded-full hover:bg-white hover:text-[var(--color-primary)] transition-all cursor-pointer"
              >
                SIGN UP
              </button>
            </div>

            {/* Khối chữ Welcome Back */}
            <div
              className={`absolute transition-all duration-500 w-full px-12 ${status === "signUp" ? "translate-x-0 opacity-100" : "-translate-x-[150%] opacity-0"}`}
            >
              <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
              <p className="text-sm mb-8 opacity-90">
                To keep connected with us please login with your personal info
              </p>
              <button
                onClick={handleToggle}
                className="border-1 border-white px-12 py-3 rounded-full hover:bg-white hover:text-[#2fb1b1] transition-all cursor-pointer"
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
