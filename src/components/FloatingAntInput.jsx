import { Input } from "antd";

const FloatingAntInput = ({
  label,
  type = "text",
  value,
  onChange,
  className = "",
  name,
}) => {
  const InputComponent = type === "password" ? Input.Password : Input;

  return (
    <div className="relative w-full group">
      <InputComponent
        size="large"
        name={name}
        value={value}
        onChange={onChange}
        autoComplete="on"
        placeholder=" " // Bắt buộc phải có một khoảng trắng để peer-placeholder-shown hoạt động
        className={`
          peer !bg-white !rounded-full !px-4 !py-2
          hover:!border-[var(--color-primary)]
          focus:!border-[var(--color-primary)]
          focus:!shadow-none
          ${className}
        `}
      />

      <label
        className={`
          absolute left-5 z-10 px-2 bg-white pointer-events-none
          transition-all duration-200 text-gray-400
          
          /* 1. Mặc định: Label nằm ở giữa ô input */
          top-1/2 -translate-y-1/2 text-sm

          /* 2. Khi input có focus: Đẩy label lên trên */
          peer-focus-within:-top-2 
          peer-focus-within:translate-y-0 
          peer-focus-within:text-xs 
          peer-focus-within:!text-[var(--color-primary)]

          /* 3. Khi input KHÔNG trống (có chữ): Giữ label ở trên */
          /* Lưu ý: !peer-placeholder-shown có nghĩa là đang có chữ bên trong */
          peer-[:not(:placeholder-shown)]:-top-2
          peer-[:not(:placeholder-shown)]:translate-y-0
          peer-[:not(:placeholder-shown)]:text-xs
        `}
      >
        {label}
      </label>
    </div>
  );
};

export default FloatingAntInput;
