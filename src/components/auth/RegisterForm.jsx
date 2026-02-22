import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { registerCompanyApi } from "../../api/authApi";
import { useToast } from "../../context/ToastContext";

const registerSchema = z
  .object({
    adminFullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
    adminEmail: z.string().email("Email không hợp lệ"),
    adminPhone: z
      .string()
      .regex(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ (9–11 chữ số)"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
    terms: z.boolean().refine((v) => v === true, "Bạn cần đồng ý với điều khoản"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

const EyeIcon = ({ open }) =>
  open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

const InputField = ({ label, error, children }) => (
  <div className="mb-3">
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const inputClass = (hasError) =>
    `w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all ${
      hasError
        ? "border-red-400 focus:border-red-500 bg-red-50"
        : "border-gray-300 focus:border-[#39C6C6] bg-white"
    }`;

  const onSubmit = async (data) => {
    setApiError("");
    try {
      await registerCompanyApi({
        adminFullName: data.adminFullName,
        adminEmail: data.adminEmail,
        adminPhone: data.adminPhone,
        password: data.password,
      });
      setSuccess(true);
      showToast({ message: "Tạo tài khoản thành công! Đang chuyển đến trang đăng nhập...", type: "success", duration: 2500 });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Đăng ký thất bại. Vui lòng thử lại.";
      setApiError(msg);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-[#1B2555] font-semibold text-lg">Đăng ký thành công!</p>
        <p className="text-gray-500 text-sm mt-1">Đang chuyển hướng đến trang đăng nhập...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <InputField error={errors.adminFullName?.message}>
        <input
          {...register("adminFullName")}
          type="text"
          placeholder="Họ và tên của bạn"
          className={inputClass(!!errors.adminFullName)}
        />
      </InputField>

      <InputField error={errors.adminEmail?.message}>
        <input
          {...register("adminEmail")}
          type="email"
          placeholder="Email của bạn"
          className={inputClass(!!errors.adminEmail)}
        />
      </InputField>

      <InputField error={errors.adminPhone?.message}>
        <input
          {...register("adminPhone")}
          type="tel"
          placeholder="Số điện thoại của bạn"
          className={inputClass(!!errors.adminPhone)}
        />
      </InputField>

      <InputField error={errors.password?.message}>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu (ít nhất 6 ký tự)"
            className={`${inputClass(!!errors.password)} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>
      </InputField>

      <InputField error={errors.confirmPassword?.message}>
        <div className="relative">
          <input
            {...register("confirmPassword")}
            type={showConfirm ? "text" : "password"}
            placeholder="Xác nhận mật khẩu"
            className={`${inputClass(!!errors.confirmPassword)} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            <EyeIcon open={showConfirm} />
          </button>
        </div>
      </InputField>

      <div className="mb-4">
        <label className="flex items-start gap-2 cursor-pointer select-none">
          <input
            {...register("terms")}
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-[#39C6C6] cursor-pointer"
          />
          <span className="text-sm text-gray-600 leading-snug">
            Tôi đã đọc và đồng ý với{" "}
            <a href="#" className="text-[#39C6C6] hover:underline">Chính sách bảo mật</a>
            {" & "}
            <a href="#" className="text-[#39C6C6] hover:underline">Quy định sử dụng</a>
          </span>
        </label>
        {errors.terms && (
          <p className="mt-1 text-xs text-red-500">{errors.terms.message}</p>
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
        {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
      </button>

      <p className="mt-5 text-center text-sm text-gray-500">
        Đã có tài khoản?{" "}
        <Link to="/login" className="text-[#39C6C6] font-medium hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
