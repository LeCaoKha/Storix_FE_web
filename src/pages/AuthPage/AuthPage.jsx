import React, { useState } from "react";

const AuthPage = () => {
  const [status, setStatus] = useState("signIn");

  const handleToggle = () => {
    setStatus(status === "signIn" ? "signUp" : "signIn");
  };

  const speed = "duration-500";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="relative w-full max-w-[850px] h-[550px] bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        {/* ==================== 1. FORM SIGN IN ==================== */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 flex flex-col items-center justify-center px-12 transition-all ${speed} ease-in-out z-20
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
            <button className="w-full py-3 mt-4 bg-[#399EC6] text-white rounded-full font-bold hover:brightness-110 transition-all active:scale-95">
              SIGN IN
            </button>
          </div>
        </div>

        {/* ==================== 2. FORM SIGN UP ==================== */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 flex flex-col items-center justify-center px-12 transition-all ${speed} ease-in-out
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
            <button className="w-full py-3 mt-4 bg-[#2fb1b1] text-white rounded-full font-bold hover:brightness-110 transition-all active:scale-95">
              SIGN UP
            </button>
          </div>
        </div>

        {/* ==================== 3. TẤM NỀN OVERLAY (ĐÃ THÊM PADDING 1.5) ==================== */}
        <div
          className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] transition-all ${speed} ease-in-out overflow-hidden z-[100]
          ${
            status === "signUp"
              ? "translate-x-0 rounded-l-2xl rounded-r-[150px]"
              : "translate-x-full rounded-r-2xl rounded-l-[150px]"
          }`}
        >
          {/* Lớp màu nền */}
          <div
            className={`absolute inset-0 bg-gradient-to-r from-[#399EC6] to-[#2fb1b1] transition-opacity ${speed}`}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-r from-[#2fb1b1] to-[#399EC6] transition-opacity ${speed} ${status === "signUp" ? "opacity-100" : "opacity-0"}`}
          />

          <div className="relative h-full flex items-center justify-center text-white px-12 text-center">
            {/* Nội dung trượt cho SignIn */}
            <div
              className={`absolute transition-all ${speed} w-full px-12 ${status === "signUp" ? "translate-x-[120%] opacity-0" : "translate-x-0 opacity-100"}`}
            >
              <h2 className="text-3xl font-bold mb-4">Hello, Friend!</h2>
              <p className="text-sm mb-8 opacity-90">
                Enter your personal details and start journey with us
              </p>
              <button
                onClick={handleToggle}
                className="border-1 border-white px-12 py-3 rounded-full hover:bg-white hover:text-[#399EC6] transition-all active:scale-95 cursor-pointer"
              >
                SIGN UP
              </button>
            </div>

            {/* Nội dung trượt cho SignUp */}
            <div
              className={`absolute transition-all ${speed} w-full px-12 ${status === "signUp" ? "translate-x-0 opacity-100" : "translate-x-[-120%] opacity-0"}`}
            >
              <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
              <p className="text-sm mb-8 opacity-90">
                To keep connected with us please login with your personal info
              </p>
              <button
                onClick={handleToggle}
                className="border-1 border-white px-12 py-3 rounded-full hover:bg-white hover:text-[#2fb1b1] transition-all active:scale-95 cursor-pointer"
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
