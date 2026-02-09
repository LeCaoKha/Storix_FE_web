export const authorizeRole = (roleId, navigate) => {
  const roleIdNumber = Number(roleId);

  // Tạo option replace để không lưu trang Login vào lịch sử
  const navOptions = { replace: true };

  if (roleIdNumber === 1) {
    navigate("/super-admin/dashboard", navOptions);
  } else if (roleIdNumber === 2) {
    navigate("/company-admin/dashboard", navOptions);
  } else if (roleIdNumber === 3) {
    navigate("/manager/dashboard", navOptions);
  } else {
    // Trường hợp role không xác định, có thể về trang chủ hoặc báo lỗi
    navigate("/", navOptions);
  }
};
