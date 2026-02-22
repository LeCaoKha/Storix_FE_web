import React from "react";
import LoginForm from "../../components/auth/LoginForm";
import storixLogo from "../../assets/images/storix-logo.png";

const WaveDecoration = () => (
  <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none">
    <svg
      viewBox="0 0 1440 220"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className="w-full"
    >
      <path
        d="M0,160 C240,220 480,100 720,140 C960,180 1200,80 1440,120 L1440,220 L0,220 Z"
        fill="#DBEAFE"
        fillOpacity="0.6"
      />
      <path
        d="M0,190 C360,140 720,200 1080,170 C1260,155 1380,180 1440,190 L1440,220 L0,220 Z"
        fill="#BFDBFE"
        fillOpacity="0.5"
      />
    </svg>
  </div>
);

const LoginPage = () => {
  return (
    <div className="relative min-h-screen bg-white flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32 pt-12">
        <div className="flex flex-col items-center mb-8">
          <img src={storixLogo} alt="Storix" className="h-96 w-96 mb-3 object-contain" />
          <p className="mt-2 text-gray-500 text-sm">Đăng nhập vào hệ thống của bạn</p>
        </div>

        <LoginForm />
      </div>

      <WaveDecoration />
    </div>
  );
};

export default LoginPage;
