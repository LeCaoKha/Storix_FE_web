import React, { useState } from "react";
import { Input, message } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios"; // Import axios

const RegisterComponent = ({ form, handleChange }) => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    setDirection(1);
    setStep(1);
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(0);
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Mapping dữ liệu theo đúng cấu trúc API yêu cầu
    const payload = {
      companyName: form.companyName,
      businessCode: form.businessCode,
      address: form.address,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      adminFullName: form.fullName,
      adminEmail: form.email,
      adminPhone: form.phone,
      password: form.password,
    };

    try {
      const response = await axios.post(
        "https://storix-docker.onrender.com/api/Companies/register",
        payload,
      );

      // Axios mặc định coi các mã 2xx là thành công
      message.success("Company registration successful!");
      console.log("Response:", response.data);

      // Có thể thêm chuyển trang tại đây: window.location.href = "/login";
    } catch (error) {
      // Axios giúp lấy lỗi từ server rất dễ dàng qua error.response
      const errorMsg =
        error.response?.data?.message ||
        "Registration failed. Please check again!";
      message.error(errorMsg);
      console.error("Axios Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? 150 : -150, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 150 : -150, opacity: 0 }),
  };

  return (
    <div className="w-full overflow-hidden">
      {/* 2 Dấu chấm Stepper */}
      <div className="flex justify-center items-center space-x-2 mb-4">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${step === 0 ? "w-6 bg-[#2fb1b1]" : "w-1.5 bg-gray-300"}`}
        />
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? "w-6 bg-[#2fb1b1]" : "w-1.5 bg-gray-300"}`}
        />
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 500, damping: 40 },
            opacity: { duration: 0.15 },
          }}
          className="space-y-5 pt-2"
        >
          {step === 0 ? (
            <FormStepOne
              form={form}
              handleChange={handleChange}
              onNext={handleNext}
            />
          ) : (
            <FormStepTwo
              form={form}
              handleChange={handleChange}
              onBack={handleBack}
              onSubmit={handleSubmit}
              loading={loading}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// --- Các thành phần con giữ nguyên như cũ ---
const FormStepOne = ({ form, handleChange, onNext }) => (
  <>
    <Field
      label="Full name"
      name="fullName"
      value={form.fullName}
      onChange={handleChange}
    />
    <Field
      label="Email"
      name="email"
      type="email"
      value={form.email}
      onChange={handleChange}
    />
    <div className="relative w-full">
      <label className="absolute left-5 -top-2 z-10 bg-white px-2 text-xs text-gray-500">
        Password
      </label>
      <Input.Password
        size="large"
        name="password"
        value={form.password}
        onChange={handleChange("password")}
        className="!bg-white !rounded-full !px-4 !py-2 hover:!border-[#2fb1b1] focus:!border-[#2fb1b1]"
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Field
        label="Company Name"
        name="companyName"
        value={form.companyName}
        onChange={handleChange}
      />
      <Field
        label="Phone"
        name="phone"
        type="tel"
        value={form.phone}
        onChange={handleChange}
      />
    </div>
    <button
      onClick={onNext}
      className="w-full py-3 bg-[#2fb1b1] text-white rounded-full font-bold active:scale-95 transition-all"
    >
      Next
    </button>
  </>
);

const FormStepTwo = ({ form, handleChange, onBack, onSubmit, loading }) => (
  <>
    {/* Contact Email được đưa lên đầu */}
    <Field
      label="Contact Email"
      name="contactEmail"
      type="email"
      value={form.contactEmail}
      onChange={handleChange}
    />
    <Field
      label="Address"
      name="address"
      value={form.address}
      onChange={handleChange}
    />
    <div className="grid grid-cols-2 gap-4">
      {/* Business Code được đưa xuống grid */}
      <Field
        label="Business Code"
        name="businessCode"
        value={form.businessCode}
        onChange={handleChange}
      />
      <Field
        label="Contact Phone"
        name="contactPhone"
        type="tel"
        value={form.contactPhone}
        onChange={handleChange}
      />
    </div>
    <div className="flex gap-4">
      <button
        onClick={onBack}
        disabled={loading}
        className="flex-1 py-2 border-2 border-[#2fb1b1] text-[#2fb1b1] rounded-full font-bold active:scale-95 transition-all"
      >
        Back
      </button>
      <button
        onClick={onSubmit}
        disabled={loading}
        className="flex-[2] py-2 bg-[#2fb1b1] text-white rounded-full font-bold hover:brightness-105 active:scale-95 disabled:bg-gray-400 transition-all"
      >
        {loading ? "Registering..." : "Submit"}
      </button>
    </div>
  </>
);

const Field = ({ label, name, value, onChange, type = "text" }) => (
  <div className="relative w-full">
    <label className="absolute left-5 -top-2 z-10 bg-white px-2 text-xs text-gray-500">
      {label}
    </label>
    <Input
      size="large"
      type={type}
      name={name}
      value={value}
      onChange={onChange(name)}
      className="!bg-white !rounded-full !px-4 !py-2 hover:!border-[#2fb1b1] focus:!border-[#2fb1b1]"
    />
  </div>
);

export default RegisterComponent;
