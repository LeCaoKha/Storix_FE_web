# Storix – Web Frontend

**Storix** là hệ thống quản lý kho thông minh tích hợp AI theo dõi tồn kho và tối ưu hóa lưu kho theo thời gian thực.

> Capstone Project · SP26SE127 · FPT University

---

## Tech Stack

| Thành phần | Công nghệ |
|------------|-----------|
| Framework | React 19 + Vite 7 |
| Styling | Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| Form & Validation | React Hook Form + Zod |
| HTTP Client | Axios (JWT interceptor) |
| State Management | React Context |

---

## Tính năng đã triển khai

### Xác thực
- [x] Đăng nhập (JWT Bearer)
- [x] Đăng ký tài khoản
- [x] Quên mật khẩu
- [x] Bảo vệ route (ProtectedRoute)
- [x] Auto-refresh token
- [x] Toast notification (thành công / thất bại)

### Dashboard
- [x] Layout sidebar + header + content
- [x] Tổng quan: tồn kho thấp, vượt mức, sắp hết hạn, quá hạn

### Hồ sơ
- [x] Xem & cập nhật thông tin cá nhân
- [x] Cập nhật thông tin công ty
- [x] Đổi mật khẩu
- [x] Upload ảnh đại diện

### Cài đặt
- [x] Chủ đề: Sáng / Tối / Theo hệ thống
- [x] Ngôn ngữ: Tiếng Việt / English
- [x] Cài đặt thông báo
- [x] Tự động đăng xuất

---

## Yêu cầu

- [Node.js](https://nodejs.org) >= 18.x
- npm >= 9.x

---

## Cài đặt & Chạy

```bash
# 1. Clone repo
git clone <repo-url>
cd Storix_FE_web

# 2. Cài dependencies
npm install

# 3. Cấu hình environment
cp .env.example .env
# Chỉnh sửa VITE_API_BASE_URL trong .env

# 4. Chạy dev server
npm run dev
```

Mở trình duyệt tại: `http://localhost:5173`

---

## Biến môi trường

Tạo file `.env` ở thư mục gốc:

```env
VITE_API_BASE_URL=http://localhost:5000
```

| Biến | Mô tả | Mặc định |
|------|-------|----------|
| `VITE_API_BASE_URL` | URL của backend .NET API | `https://localhost:7157` |

---

## Scripts

```bash
npm run dev       # Chạy development server (HMR)
npm run build     # Build production
npm run preview   # Xem bản build production
npm run lint      # Kiểm tra ESLint
```

---

## Cấu trúc dự án

```
src/
├── api/                  # Axios instance & API calls
│   ├── axiosInstance.js  # Base config, JWT interceptor, auto-refresh
│   ├── authApi.js        # login, register, forgotPassword
│   └── profileApi.js     # getProfile, updateProfile, uploadAvatar
│
├── assets/images/        # Logo, hình ảnh
│
├── components/
│   ├── auth/             # LoginForm, RegisterForm
│   └── layout/           # Sidebar, Header
│
├── context/
│   ├── AuthContext.jsx   # Token, user, login/logout state
│   ├── SettingsContext.jsx # Theme, language, notifications
│   └── ToastContext.jsx  # Global toast notifications
│
├── hooks/
│   ├── useAuth.js        # Hook cho AuthContext
│   └── useSettings.js    # (via SettingsContext)
│
├── layouts/
│   └── DashboardLayout.jsx # Sidebar + Header + Outlet
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── ForgotPasswordPage.jsx
│   ├── dashboard/
│   │   └── DashboardPage.jsx
│   ├── profile/
│   │   └── ProfilePage.jsx
│   └── settings/
│       └── SettingsPage.jsx
│
├── router/
│   ├── router.jsx        # Route definitions
│   └── ProtectedRoute.jsx
│
├── App.jsx
├── main.jsx
└── index.css             # Tailwind + dark mode overrides
```

---

## Vai trò người dùng

| Vai trò | Mô tả |
|---------|-------|
| **Company Admin** | Quản lý kho, nhân viên, sản phẩm, báo cáo |
| **Warehouse Staff** | Nhận task, cập nhật tồn kho, xem đường picking |
| **Super Admin** | Quản lý toàn hệ thống, subscription, AI config |

---

## Liên quan

| Repo | Mô tả |
|------|-------|
| `Storix_BE` | Backend API (.NET) |
| `Storix_AI` | AI Microservice (Python/FastAPI) |
| `Storix_Mobile` | Mobile App (Flutter) |

---

## Nhóm phát triển

**SP26SE127** · FPT University · Capstone Project 2026
