import React from "react";
import { Select, Input } from "antd";

const cities = [
  { value: "baria", label: "Bà Rịa" },
  { value: "bacgiang", label: "Bắc Giang" },
  { value: "bacninh", label: "Bắc Ninh" },
  { value: "baoloc", label: "Bảo Lộc" },
  { value: "bentre", label: "Bến Tre" },
  { value: "bienhoa", label: "Biên Hòa" },
  { value: "camau", label: "Cà Mau" },
  { value: "campha", label: "Cẩm Phả" },
  { value: "camranh", label: "Cam Ranh" },
  { value: "cantho", label: "Cần Thơ" },
  { value: "caolanh", label: "Cao Lãnh" },
  { value: "chaudoc", label: "Châu Đốc" },
  { value: "chilinh", label: "Chí Linh" },
  { value: "dalat", label: "Đà Lạt" },
  { value: "danang", label: "Đà Nẵng" },
  { value: "dian", label: "Dĩ An" },
  { value: "dongha", label: "Đông Hà" },
  { value: "donghoi", label: "Đồng Hới" },
  { value: "halong", label: "Hạ Long" },
  { value: "hanoi", label: "Hà Nội" },
  { value: "hatien", label: "Hà Tiên" },
  { value: "hatinh", label: "Hà Tĩnh" },
  { value: "haiduong", label: "Hải Dương" },
  { value: "haiphong", label: "Hải Phòng" },
  { value: "hochiminh", label: "TP. Hồ Chí Minh" },
  { value: "hoian", label: "Hội An" },
  { value: "hungyen", label: "Hưng Yên" },
  { value: "longkhanh", label: "Long Khánh" },
  { value: "longxuyen", label: "Long Xuyên" },
  { value: "mongcai", label: "Móng Cái" },
  { value: "mytho", label: "Mỹ Tho" },
  { value: "namdinh", label: "Nam Định" },
  { value: "nhatrang", label: "Nha Trang" },
  { value: "ninhbinh", label: "Ninh Bình" },
  { value: "phanthiet", label: "Phan Thiết" },
  { value: "phuly", label: "Phủ Lý" },
  { value: "quangngai", label: "Quảng Ngãi" },
  { value: "quynhon", label: "Quy Nhơn" },
  { value: "rachgia", label: "Rạch Giá" },
  { value: "sadec", label: "Sa Đéc" },
  { value: "samlson", label: "Sầm Sơn" },
  { value: "songcong", label: "Sông Công" },
  { value: "tanan", label: "Tân An" },
  { value: "tamky", label: "Tam Kỳ" },
  { value: "thainguyen", label: "Thái Nguyên" },
  { value: "thanhhoa", label: "Thanh Hóa" },
  { value: "thudaumot", label: "Thủ Dầu Một" },
  { value: "travinh", label: "Trà Vinh" },
  { value: "tuyhoa", label: "Tuy Hòa" },
  { value: "tuson", label: "Từ Sơn" },
  { value: "uongbi", label: "Uông Bí" },
  { value: "vinh", label: "Vinh" },
  { value: "vinhlong", label: "Vĩnh Long" },
  { value: "vinhyen", label: "Vĩnh Yên" },
  { value: "viettri", label: "Việt Trì" },
  { value: "vungtau", label: "Vũng Tàu" },
];

const RegisterComponent = ({ form, handleChange, setForm }) => {
  return (
    <div className="w-full space-y-5">
      {/* Full Name Input */}
      <div className="relative w-full">
        <label className="absolute left-5 -top-2 z-10 bg-white px-2 text-xs text-gray-500 pointer-events-none">
          Full name
        </label>

        <Input
          size="large"
          name="fullName"
          value={form.fullName}
          onChange={handleChange("fullName")}
          className="!bg-white !rounded-full !px-4 !py-2 hover:!border-[var(--color-primary)] focus:!border-[var(--color-primary)] focus:!shadow-none"
        />
      </div>

      {/* Store Name Input */}
      <div className="relative w-full">
        <label className="absolute left-5 -top-2 z-10 bg-white px-2 text-xs text-gray-500 pointer-events-none">
          Store name
        </label>

        <Input
          size="large"
          name="storeName"
          value={form.storeName}
          onChange={handleChange("storeName")}
          className="!bg-white !rounded-full !px-4 !py-2 hover:!border-[var(--color-primary)] focus:!border-[var(--color-primary)] focus:!shadow-none"
        />
      </div>

      {/* City + Phone */}
      <div className="grid grid-cols-2 gap-4">
        {/* City */}
        <div className="relative w-full">
          <label className="absolute left-5 -top-2 z-10 bg-white px-2 text-xs text-gray-500 pointer-events-none">
            City
          </label>

          <Select
            size="large"
            showSearch
            optionFilterProp="label"
            value={form.city || undefined}
            onChange={(value) => setForm((prev) => ({ ...prev, city: value }))}
            className="!w-full !rounded-full"
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            options={cities}
          />
        </div>

        {/* Phone */}
        <div className="relative w-full">
          <label className="absolute left-5 -top-2 z-10 bg-white px-2 text-xs text-gray-500 pointer-events-none">
            Phone
          </label>

          <Input
            size="large"
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange("phone")}
            className="!bg-white !rounded-full !px-4 !py-2 hover:!border-[var(--color-primary)] focus:!border-[var(--color-primary)] focus:!shadow-none"
          />
        </div>
      </div>

      {/* Sign Up Button */}
      <button className="cursor-pointer w-full py-3 bg-[#2fb1b1] text-white rounded-full font-bold hover:brightness-110 transition-all active:scale-95">
        SIGN UP
      </button>
    </div>
  );
};

export default RegisterComponent;
