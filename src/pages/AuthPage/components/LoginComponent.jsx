import React, { useState } from "react";
import { Input, message, Spin } from "antd"; // Thêm Spin nếu bạn muốn hiện icon loading
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { authorizeRole } from "../../../utils/utils";

const LoginComponent = ({ form, handleChange }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      return message.warning("Please enter your full email and password!");
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://storix-docker.onrender.com/api/Home/Login",
        {
          email: form.email,
          password: form.password,
        },
      );

      message.success("Login successful!");
      console.log("Login Success:", response.data);

      const roleId = response.data.roleId;
      const token = response.data.token;

      localStorage.setItem("token", token);
      localStorage.setItem("roleId", roleId);

      authorizeRole(roleId, navigate);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Login failed!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay vô hình chặn tương tác. 
        Sử dụng fixed để đè lên toàn bộ trình duyệt, z-50 để nằm trên cùng.
      */}
      {loading && (
        <div className="fixed inset-0 z-[9999] bg-white/10 cursor-wait flex items-center justify-center">
          {/* Bạn có thể bỏ <Spin /> nếu muốn overlay hoàn toàn trống trơn */}
          {/* <Spin size="large" /> */}
        </div>
      )}

      <div className="flex flex-col items-center w-full space-y-5">
        {/* Google login */}
        <div className="cursor-pointer pl-3 pr-3 py-1 w-fit gap-1 flex items-center mb-6 border-1 border-gray-300 hover:border-[var(--color-primary)] rounded-4xl transition-colors">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 48 48"
            >
              <path
                fill="#ffc107"
                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917"
              />
              <path
                fill="#ff3d00"
                d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691"
              />
              <path
                fill="#4caf50"
                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.9 11.9 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44"
              />
              <path
                fill="#1976d2"
                d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917"
              />
            </svg>
          </div>
          <div className="text-sm font-medium">Sign in with Google</div>
        </div>

        {/* Email Input */}
        <div className="relative w-full">
          <label className="absolute left-5 -top-2 z-10 bg-white px-2 text-xs text-gray-500 pointer-events-none">
            Email
          </label>
          <Input
            size="large"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange("email")}
            disabled={loading}
            className="!bg-white !rounded-full !px-4 !py-2 hover:!border-[var(--color-primary)] focus:!border-[var(--color-primary)]"
          />
        </div>

        {/* Password Input */}
        <div className="relative w-full">
          <label className="absolute left-5 -top-2 z-10 bg-white px-2 text-xs text-gray-500 pointer-events-none">
            Password
          </label>
          <Input.Password
            size="large"
            name="password"
            value={form.password}
            onChange={handleChange("password")}
            disabled={loading}
            onPressEnter={handleLogin}
            className="!bg-white !rounded-full !px-4 !py-2 hover:!border-[var(--color-primary)] focus:!border-[var(--color-primary)]"
          />
        </div>

        {/* Forgot Password */}
        <p className="text-sm text-gray-400 text-center cursor-pointer hover:underline">
          Forgot your password?
        </p>

        {/* Sign In Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="cursor-pointer w-full py-3 bg-[var(--color-primary)] text-white rounded-full font-bold hover:brightness-110 transition-all active:scale-95 disabled:bg-gray-400"
        >
          {loading ? "SIGNING IN..." : "SIGN IN"}
        </button>
      </div>
    </>
  );
};

export default LoginComponent;
