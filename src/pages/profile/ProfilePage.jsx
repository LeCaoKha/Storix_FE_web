import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useAuth from "../../hooks/useAuth";
import {
  getProfileApi,
  updateProfileApi,
  updateCompanyApi,
  changePasswordApi,
  uploadAvatarApi,
} from "../../api/profileApi";

const personalSchema = z.object({
  adminFullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  adminPhone: z.string().regex(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ"),
});

const companySchema = z.object({
  companyName: z.string().min(1, "Vui lòng nhập tên công ty"),
  businessCode: z.string().optional(),
  address: z.string().optional(),
  contactEmail: z.union([z.literal(""), z.string().email("Email không hợp lệ")]),
  contactPhone: z.union([z.literal(""), z.string().regex(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ")]),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

const TABS = [
  { key: "personal", label: "Thông tin cá nhân" },
  { key: "company", label: "Thông tin công ty" },
  { key: "security", label: "Bảo mật" },
];

const inputClass = (hasError) =>
  `w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all ${
    hasError
      ? "border-red-400 focus:border-red-500 bg-red-50"
      : "border-gray-300 focus:border-[#39C6C6] bg-white"
  }`;

const FieldRow = ({ label, required, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
    ${type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
    {type === "success" ? (
      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )}
    {message}
    <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

const PersonalTab = ({ user, onToast }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(personalSchema),
    defaultValues: { adminFullName: "", adminPhone: "" },
  });

  useEffect(() => {
    if (user) {
      reset({
        adminFullName: user.adminFullName || user.name || "",
        adminPhone: user.adminPhone || user.phone || "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      await updateProfileApi(data);
      onToast("Cập nhật thông tin thành công!", "success");
    } catch {
      onToast("Cập nhật thất bại. Vui lòng thử lại.", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FieldRow label="Họ và tên" required error={errors.adminFullName?.message}>
        <input {...register("adminFullName")} type="text" placeholder="Nhập họ và tên" className={inputClass(!!errors.adminFullName)} />
      </FieldRow>

      <FieldRow label="Email">
        <input
          type="email"
          value={user?.email || user?.adminEmail || ""}
          disabled
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-400">Email không thể thay đổi</p>
      </FieldRow>

      <FieldRow label="Số điện thoại" error={errors.adminPhone?.message}>
        <input {...register("adminPhone")} type="tel" placeholder="Nhập số điện thoại" className={inputClass(!!errors.adminPhone)} />
      </FieldRow>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all
            bg-gradient-to-r from-[#39C6C6] to-[#75F0A8]
            hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
};

const CompanyTab = ({ onToast }) => {
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: { companyName: "", businessCode: "", address: "", contactEmail: "", contactPhone: "" },
  });

  useEffect(() => {
    getProfileApi()
      .then((res) => {
        const c = res.company || res.data?.company || {};
        reset({
          companyName: c.companyName || "",
          businessCode: c.businessCode || "",
          address: c.address || "",
          contactEmail: c.contactEmail || "",
          contactPhone: c.contactPhone || "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      await updateCompanyApi(data);
      onToast("Cập nhật thông tin công ty thành công!", "success");
    } catch {
      onToast("Cập nhật thất bại. Vui lòng thử lại.", "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FieldRow label="Tên công ty" required error={errors.companyName?.message}>
        <input {...register("companyName")} type="text" placeholder="VD: Công ty TNHH Storix" className={inputClass(!!errors.companyName)} />
      </FieldRow>

      <FieldRow label="Mã số doanh nghiệp" error={errors.businessCode?.message}>
        <input {...register("businessCode")} type="text" placeholder="VD: 0123456789" className={inputClass(!!errors.businessCode)} />
      </FieldRow>

      <FieldRow label="Địa chỉ" error={errors.address?.message}>
        <input {...register("address")} type="text" placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM" className={inputClass(!!errors.address)} />
      </FieldRow>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FieldRow label="Email liên hệ" error={errors.contactEmail?.message}>
          <input {...register("contactEmail")} type="email" placeholder="VD: contact@storix.vn" className={inputClass(!!errors.contactEmail)} />
        </FieldRow>
        <FieldRow label="Số điện thoại liên hệ" error={errors.contactPhone?.message}>
          <input {...register("contactPhone")} type="tel" placeholder="VD: 0901234567" className={inputClass(!!errors.contactPhone)} />
        </FieldRow>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all
            bg-gradient-to-r from-[#39C6C6] to-[#75F0A8]
            hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
};

const SecurityTab = ({ onToast }) => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data) => {
    try {
      await changePasswordApi(data);
      onToast("Đổi mật khẩu thành công!", "success");
      reset();
    } catch (err) {
      const msg = err.response?.data?.message || "Mật khẩu hiện tại không đúng.";
      onToast(msg, "error");
    }
  };

  const PasswordInput = ({ name, placeholder, show, onToggle, error }) => (
    <FieldRow label={placeholder} error={error}>
      <div className="relative">
        <input
          {...register(name)}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className={`${inputClass(!!error)} pr-11`}
        />
        <button type="button" onClick={onToggle} tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>
    </FieldRow>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md">
      <PasswordInput name="currentPassword" placeholder="Mật khẩu hiện tại" show={showCurrent} onToggle={() => setShowCurrent(v => !v)} error={errors.currentPassword?.message} />
      <PasswordInput name="newPassword" placeholder="Mật khẩu mới" show={showNew} onToggle={() => setShowNew(v => !v)} error={errors.newPassword?.message} />
      <PasswordInput name="confirmPassword" placeholder="Xác nhận mật khẩu mới" show={showConfirm} onToggle={() => setShowConfirm(v => !v)} error={errors.confirmPassword?.message} />

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all
            bg-gradient-to-r from-[#39C6C6] to-[#75F0A8]
            hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Đang đổi..." : "Đổi mật khẩu"}
        </button>
      </div>
    </form>
  );
};

const AvatarUploader = ({ user, onToast }) => {
  const { updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(user?.avatarUrl || user?.avatar || null);

  const initials = user?.adminFullName
    ? user.adminFullName.split(" ").map((w) => w[0]).slice(-2).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      onToast("Chỉ chấp nhận file JPG, PNG hoặc WEBP.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onToast("Dung lượng ảnh tối đa 5MB.", "error");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);
    try {
      const res = await uploadAvatarApi(file);
      const avatarUrl = res.avatarUrl || res.data?.avatarUrl || localPreview;
      updateUser({ avatarUrl });
      onToast("Cập nhật ảnh đại diện thành công!", "success");
    } catch {
      setPreview(user?.avatarUrl || user?.avatar || null);
      onToast("Tải ảnh thất bại. Vui lòng thử lại.", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="relative flex-shrink-0 group" onClick={() => !uploading && fileInputRef.current?.click()}>
      <div className="w-20 h-20 rounded-full overflow-hidden cursor-pointer ring-2 ring-[#39C6C6]/30 group-hover:ring-[#39C6C6] transition-all">
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#39C6C6] to-[#75F0A8] flex items-center justify-center text-white text-2xl font-bold">
            {initials}
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
          {uploading ? (
            <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </div>
      </div>
      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#39C6C6] rounded-full flex items-center justify-center shadow-md cursor-pointer border-2 border-white">
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Hồ sơ của tôi</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center gap-5">
        <AvatarUploader user={user} onToast={showToast} />
        <div>
          <p className="text-base font-semibold text-gray-800">
            {user?.adminFullName || user?.name || "Người dùng"}
          </p>
          <p className="text-sm text-gray-500">{user?.email || user?.adminEmail || ""}</p>
          <span className="mt-1 inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#39C6C6]/15 text-[#39C6C6]">
            Company Admin
          </span>
          <p className="mt-1.5 text-xs text-gray-400">Nhấn vào ảnh để thay đổi ảnh đại diện</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-[#39C6C6] text-[#39C6C6]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "personal" && <PersonalTab user={user} onToast={showToast} />}
          {activeTab === "company" && <CompanyTab onToast={showToast} />}
          {activeTab === "security" && <SecurityTab onToast={showToast} />}
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default ProfilePage;
