import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import storixLogo from "../../assets/images/storix-logo.png";
import { forgotPasswordApi } from "../../api/authApi";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

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

const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setApiError("");
    try {
      await forgotPasswordApi({ email: data.email });
      setSentEmail(data.email);
      setSent(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Không tìm thấy tài khoản với email này.";
      setApiError(msg);
    }
  };

  return (
    <div className="relative min-h-screen bg-white flex flex-col overflow-hidden">
      <div className="absolute top-5 left-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-[#39C6C6] hover:text-[#1B2555] transition-colors font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại đăng nhập
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32 pt-16">
        <div className="flex flex-col items-center mb-8">
          <img src={storixLogo} alt="Storix" className="h-36 w-36 object-contain" />
        </div>

        <div className="w-full max-w-sm">
          {!sent ? (
            <>
              <div className="text-center mb-7">
                <h1 className="text-2xl font-bold text-[#1B2555]">Quên mật khẩu?</h1>
                <p className="mt-2 text-sm text-gray-500">
                  Nhập email đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="mb-5">
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="Email của bạn"
                    className={`w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all
                      ${errors.email
                        ? "border-red-400 focus:border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-[#39C6C6] bg-white"
                      }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {apiError && (
                  <div className="mb-4 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                    {apiError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full font-semibold text-white text-sm transition-all
                    bg-gradient-to-r from-[#39C6C6] to-[#75F0A8]
                    hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Nhớ mật khẩu rồi?{" "}
                <Link to="/login" className="text-[#39C6C6] font-medium hover:underline">
                  Đăng nhập
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#1B2555] mb-2">Kiểm tra email của bạn</h2>
              <p className="text-sm text-gray-500 mb-1">
                Chúng tôi đã gửi link đặt lại mật khẩu đến
              </p>
              <p className="text-sm font-semibold text-[#1B2555] mb-6">{sentEmail}</p>
              <p className="text-xs text-gray-400 mb-6">
                Không nhận được email? Kiểm tra hộp thư rác hoặc{" "}
                <button
                  onClick={() => { setSent(false); setApiError(""); }}
                  className="text-[#39C6C6] hover:underline font-medium"
                >
                  thử lại
                </button>
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#39C6C6] hover:text-[#1B2555] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại đăng nhập
              </Link>
            </div>
          )}
        </div>
      </div>

      <WaveDecoration />
    </div>
  );
};

export default ForgotPasswordPage;
