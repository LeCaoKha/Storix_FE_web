export const authorizeRole = (roleId, navigate) => {
  const roleIdNumber = Number(roleId);
  if (roleIdNumber === 1) {
    navigate("/super-admin/dashboard");
  } else if (roleIdNumber === 2) {
    navigate("/company-admin/dashboard");
  } else if (roleIdNumber === 3) {
    navigate("/manager/dashboard");
  }
};
