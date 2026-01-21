import React, { useState } from "react";
import { Select, Input } from "antd";
import FloatingAntInput from "../../components/FloatingAntInput";

const { Option } = Select;

const AuthPage = () => {
  const [status, setStatus] = useState("signIn");

  // Thêm state để theo dõi focus riêng cho Password
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

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

  // Kiểm tra label password có cần bay lên không (do có chữ hoặc đang focus)
  const isPasswordActive = isPasswordFocused || Boolean(form.password);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="relative w-full max-w-[850px] h-[550px] bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        {/* ==================== SIGN IN ==================== */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 flex flex-col items-center justify-center px-12 transition-all ${speed} ease-in-out
          ${status === "signUp" ? "translate-x-full opacity-0 z-10" : "translate-x-0 opacity-100 z-20"}`}
        >
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Sign In</h2>

          <div className="w-full space-y-4">
            <FloatingAntInput
              label="Email"
              value={form.email}
              onChange={handleChange("email")}
            />

            <div className="relative w-full group">
              <Input.Password
                size="large"
                name="password"
                value={form.password}
                placeholder=" "
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                onChange={handleChange("password")}
                className={`
                  peer !bg-white !rounded-full !px-4 !py-2
                  hover:!border-[var(--color-primary)]
                  focus:!border-[var(--color-primary)]
                  focus:!shadow-none
                  focus-within:!shadow-none
                `}
              />
              <label
                className={`
                  absolute left-5 z-10 px-2 bg-white pointer-events-none transition-all duration-200
                  ${isPasswordActive ? "-top-2 text-xs" : "top-1/2 -translate-y-1/2 text-sm"}
                  ${isPasswordFocused ? "text-[var(--color-primary)]" : "text-gray-400"}
                  peer-focus-within:!text-[var(--color-primary)]
                  peer-focus-within:!translate-y-0
                  peer-[:has(input:not(:placeholder-shown))]:-top-2
                  peer-[:has(input:not(:placeholder-shown))]:text-xs
                  peer-[:has(input:not(:placeholder-shown))]:translate-y-0
                  peer-[:has(input:-webkit-autofill)]:-top-2
                  peer-[:has(input:-webkit-autofill)]:text-xs
                  peer-[:has(input:-webkit-autofill)]:translate-y-0
                `}
              >
                Password
              </label>
            </div>

            <p className="text-sm text-gray-400 text-center cursor-pointer hover:underline">
              Forgot your password?
            </p>

            <button className="w-full py-3 bg-[var(--color-primary)] text-white rounded-full font-bold hover:brightness-110 transition-all active:scale-95">
              SIGN IN
            </button>
          </div>
        </div>

        {/* ==================== SIGN UP ==================== */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 flex flex-col items-center justify-center px-12 transition-all ${speed} ease-in-out
          ${status === "signUp" ? "translate-x-full opacity-100 z-20" : "translate-x-0 opacity-0 z-10"}`}
        >
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Create Account
          </h2>

          <div className="w-full space-y-4">
            <FloatingAntInput
              label="Full name"
              value={form.fullName}
              onChange={handleChange("fullName")}
            />
            <FloatingAntInput
              label="Store name"
              value={form.storeName}
              onChange={handleChange("storeName")}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                size="large"
                value={form.city || undefined}
                placeholder="Your city"
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, city: value }))
                }
                className="!rounded-full"
              >
                <Option value="hanoi">Hanoi</Option>
                <Option value="hcm">Ho Chi Minh City</Option>
                <Option value="danang">Da Nang</Option>
              </Select>
              <FloatingAntInput
                label="Phone"
                value={form.phone}
                onChange={handleChange("phone")}
              />
            </div>

            <button className="w-full py-3 bg-[#2fb1b1] text-white rounded-full font-bold hover:brightness-110 transition-all active:scale-95">
              SIGN UP
            </button>
          </div>
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
            {/* Khối 1: Hello Friend (Di chuyển sang phải khi signUp) */}
            <div
              className={`absolute transition-all ${speed} ease-in-out w-full px-12
              ${status === "signUp" ? "translate-x-[120%] opacity-0" : "translate-x-0 opacity-100"}`}
            >
              <h2 className="text-3xl font-bold mb-4">Hello, Friend!</h2>
              <p className="text-sm mb-8 opacity-90">
                Enter your personal details and start journey with us
              </p>
              <button
                onClick={() => setStatus("signUp")}
                className="border border-white px-12 py-3 rounded-full hover:bg-white hover:text-[var(--color-primary)] transition-all cursor-pointer"
              >
                SIGN UP
              </button>
            </div>

            {/* Khối 2: Welcome Back (Di chuyển từ trái vào khi signUp) */}
            <div
              className={`absolute transition-all ${speed} ease-in-out w-full px-12
              ${status === "signUp" ? "translate-x-0 opacity-100" : "-translate-x-[120%] opacity-0"}`}
            >
              <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
              <p className="text-sm mb-8 opacity-90">
                Please login with your personal info
              </p>
              <button
                onClick={() => setStatus("signIn")}
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
