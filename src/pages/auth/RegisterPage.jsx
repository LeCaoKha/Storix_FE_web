import React from "react";
import { Link } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";
import storixLogo from "../../assets/images/storix-logo.png";

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-[#EEF2F7] px-4 py-10">
      <div className="mb-4">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-[#39C6C6] hover:text-[#1B2555] transition-colors font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </Link>
      </div>

      <div className="flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg px-8 py-8">
          <div className="flex flex-col items-center mb-6">
            <img src={storixLogo} alt="Storix" className="h-44 w-44 mb-2 object-contain" />
            <h1 className="mt-1 text-2xl font-bold text-[#1B2555] text-center">
              Tạo tài khoản
            </h1>
            <p className="mt-1 text-sm text-gray-500 text-center">
              Bắt đầu quản lý kho thông minh ngay hôm nay
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
