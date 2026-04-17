import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import NotFound from "../pages/NotFound/NotFound";
import AuthPage from "../pages/AuthPage/AuthPage";
import LandingPage from "../pages/LandingPage/LandingPage";
import AboutPage from "../pages/About/About";
import ExplorePage from "../pages/Explore/Explore";
import ContactPage from "../pages/Contact/Contact";
import AdminLayout from "../layouts/AdminLayout";
import AccountManagement from "../pages/CompanyAdmin/components/AccountManagement/AccountManagement";
import Dashboard from "../pages/CompanyAdmin/components/Dashboard/Dashboard";
import InboundTicketManagement from "../pages/CompanyAdmin/components/InboundTicketManagement/InboundTicketManagement";
import InboundTicketCreate from "../pages/CompanyAdmin/components/InboundTicketManagement/components/InboundTicketCreate/InboundTicketCreate";
import ProductManagement from "../pages/CompanyAdmin/components/ProductManagement/ProductManagement";
import ReportManagement from "../pages/CompanyAdmin/components/ReportManagement/ReportManagement";
import WarehouseManagement from "../pages/CompanyAdmin/components/WarehouseManagement/WarehouseManagement";
import WarehouseConfiguration from "../pages/WarehouseConfiguration/WarehouseConfiguration";
import Profile from "../pages/Profile/Profile";
import CreateProduct from "../pages/CompanyAdmin/components/ProductManagement/components/CreateProduct/CreateProduct";
import EditProduct from "../pages/CompanyAdmin/components/ProductManagement/components/EditProduct/EditProduct";
import EditProfile from "../pages/Profile/components/EditProfile";
import AccountDetails from "../pages/CompanyAdmin/components/AccountManagement/components/AccountDetails/AccountDetails";
import CreateAccount from "../pages/CompanyAdmin/components/AccountManagement/components/CreateAccount/CreateAccount";
import SupplierManagement from "../pages/CompanyAdmin/components/SupplierManagement/SupplierManagement";
import InboundRequestManagement from "../pages/CompanyAdmin/components/InboundRequestManagement/InboundRequestManagement";
import InboundRequestDetails from "../pages/CompanyAdmin/components/InboundRequestManagement/components/InboundRequestDetails/InboundRequestDetails";
import InboundRequestCreate from "../pages/CompanyAdmin/components/InboundRequestManagement/components/InboundRequestCreate/InboundRequestCreate";
import ProductDetails from "../pages/CompanyAdmin/components/ProductManagement/components/ProductDetails/ProductDetails";
import InboundTicketDetails from "../pages/CompanyAdmin/components/InboundTicketManagement/components/InboundTicketDetails/InboundTicketDetails";
import OutboundRequestManagement from "../pages/CompanyAdmin/components/OutboundRequestManagement/OutboundRequestManagement";
import OutboundRequestCreate from "../pages/CompanyAdmin/components/OutboundRequestManagement/components/OutboundRequestCreate/OutboundRequestCreate";
import WarehouseDetails from "../pages/CompanyAdmin/components/WarehouseManagement/components/WarehouseDetails/WarehouseDetails";
import CreateWarehouse from "../pages/CompanyAdmin/components/WarehouseManagement/components/CreateWarehouse/CreateWarehouse";
import InventoryManagement from "../pages/CompanyAdmin/components/InventoryManagement/InventoryManagement";
import InventoryDetails from "../pages/CompanyAdmin/components/InventoryManagement/components/InventoryDetails/InventoryDetails";
import OutboundRequestDetails from "../pages/CompanyAdmin/components/OutboundRequestManagement/components/OutboundRequestDetails/OutboundRequestDetails";
import OutboundTicketManagement from "../pages/CompanyAdmin/components/OutboundTicketManagement/OutboundTicketManagement";
import OutboundTicketCreate from "../pages/CompanyAdmin/components/OutboundTicketManagement/components/OutboundTicketCreate/OutboundTicketCreate";
import OutboundTicketDetails from "../pages/CompanyAdmin/components/OutboundTicketManagement/components/OutboundTicketDetails/OutboundTicketDetails";
import InventoryCount from "../pages/CompanyAdmin/components/InventoryCount/InventoryCount";
import InventoryCountCreate from "../pages/CompanyAdmin/components/InventoryCount/components/InventoryCountCreate/InventoryCountCreate";
import WarehouseTransferManagement from "../pages/Manager/components/WarehouseTransferManagement/WarehouseTransferManagement";
import ManagerDashboard from "../pages/Manager/components/Dashboard/Dashboard";

/**
 * 1. SHARED ADMIN ROUTES (Quyền hạn đầy đủ cho Admin & Manager)
 */
const sharedAdminRoutes = [
  { path: "dashboard", element: <Dashboard /> },

  // OUTBOUND REQUEST MANAGEMENT
  { path: "outbound-management", element: <OutboundRequestManagement /> },
  { path: "outbound-management/create", element: <OutboundRequestCreate /> },
  {
    path: "outbound-management/details/:id",
    element: <OutboundRequestDetails />,
  },

  // OUTBOUND TICKET MANAGEMENT
  {
    path: "outbound-ticket-management",
    element: <OutboundTicketManagement />,
  },
  {
    path: "outbound-ticket-management/create/:id",
    element: <OutboundTicketCreate />,
  },
  {
    path: "outbound-ticket-management/details/:id",
    element: <OutboundTicketDetails />,
  },

  // PRODUCT MANAGEMENT
  { path: "product-management", element: <ProductManagement /> },
  { path: "product-management/details/:id", element: <ProductDetails /> },
  { path: "product-management/create", element: <CreateProduct /> },
  { path: "product-management/edit/:id", element: <EditProduct /> },

  // REPORT MANAGEMENT
  { path: "report-management", element: <ReportManagement /> },

  // ACCOUNT MANAGEMENT
  { path: "account-management", element: <AccountManagement /> },
  { path: "account-management/create", element: <CreateAccount /> },
  { path: "account-management/details/:id", element: <AccountDetails /> },

  // INBOUND REQUEST MANAGEMENT
  { path: "inbound-request-management", element: <InboundRequestManagement /> },
  {
    path: "inbound-request-management/details/:id",
    element: <InboundRequestDetails />,
  },
  {
    path: "inbound-request-management/create",
    element: <InboundRequestCreate />,
  },

  // INBOUND TICKET MANAGEMENT
  { path: "inbound-ticket-management", element: <InboundTicketManagement /> },
  {
    path: "inbound-ticket-management/create/:id",
    element: <InboundTicketCreate />,
  },
  {
    path: "inbound-ticket-management/details/:id",
    element: <InboundTicketDetails />,
  },

  // SUPPLIER MANAGEMENT
  { path: "supplier-management", element: <SupplierManagement /> },

  // WAREHOUSE MANAGEMENT
  { path: "warehouse-management", element: <WarehouseManagement /> },
  { path: "warehouse-management/details/:id", element: <WarehouseDetails /> },
  { path: "warehouse-management/create", element: <CreateWarehouse /> },

  // PROFILE MANAGEMENT
  { path: "profile/:id", element: <Profile /> },
  { path: "profile/:id/edit", element: <EditProfile /> },

  // INVENTORY MANAGEMENT
  { path: "inventory-management", element: <InventoryManagement /> },
  { path: "inventory-management/details/:id", element: <InventoryDetails /> },

  // INVENTORY COUNT MANAGEMENT
  { path: "inventory-count", element: <InventoryCount /> },
  { path: "inventory-count/create", element: <InventoryCountCreate /> },
  // WAREHOUSE TRANSFER MANAGEMENT
  {
    path: "warehouse-transfer-management",
    element: <WarehouseTransferManagement />,
  },
];

const managerRoutes = [
  { path: "dashboard", element: <ManagerDashboard /> },
  ...sharedAdminRoutes.filter((route) => route.path !== "dashboard"),
];

/**
 * 2. STAFF ROUTES (Quyền hạn hạn chế cho Staff)
 */
const staffRoutes = [
  // OUTBOUND REQUEST MANAGEMENT
  { path: "outbound-management", element: <OutboundRequestManagement /> },
  { path: "outbound-management/create", element: <OutboundRequestCreate /> },
  {
    path: "outbound-management/details/:id",
    element: <OutboundRequestDetails />,
  },

  // --- BỔ SUNG: Cho phép Staff truy cập Outbound Ticket ---
  {
    path: "outbound-ticket-management",
    element: <OutboundTicketManagement />,
  },
  {
    path: "outbound-ticket-management/create/:id",
    element: <OutboundTicketCreate />,
  },

  // INBOUND REQUEST MANAGEMENT
  { path: "inbound-request-management", element: <InboundRequestManagement /> },
  {
    path: "inbound-request-management/details/:id",
    element: <InboundRequestDetails />,
  },
  {
    path: "inbound-request-management/create",
    element: <InboundRequestCreate />,
  },

  // INBOUND TICKET MANAGEMENT
  { path: "inbound-ticket-management", element: <InboundTicketManagement /> },
  {
    path: "inbound-ticket-management/create/:id",
    element: <InboundTicketCreate />,
  },
  {
    path: "inbound-ticket-management/details/:id",
    element: <InboundTicketDetails />,
  },

  // INVENTORY MANAGEMENT
  { path: "inventory-management", element: <InventoryManagement /> },
  { path: "inventory-management/details/:id", element: <InventoryDetails /> },

  // Profile cho Staff
  { path: "profile/:id", element: <Profile /> },
  { path: "profile/:id/edit", element: <EditProfile /> },
];

/**
 * 3. ROUTER CONFIGURATION
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/explore", element: <ExplorePage /> },
      { path: "/contact", element: <ContactPage /> },
    ],
  },
  {
    path: "/company-admin",
    element: <AdminLayout allowedRoles={[2]} />,
    children: sharedAdminRoutes,
  },
  {
    path: "/manager",
    element: <AdminLayout allowedRoles={[3]} />,
    children: managerRoutes,
  },
  {
    path: "/staff",
    element: <AdminLayout allowedRoles={[4]} />, // Giả định Role ID của Staff là 4
    children: staffRoutes,
  },
  {
    path: "company-admin/warehouse-configuration/:id",
    element: <WarehouseConfiguration />,
  },
  { path: "profile", element: <Profile /> },
  { path: "warehouse-config", element: <WarehouseConfiguration /> },
  { path: "auth", element: <AuthPage /> },
  { path: "*", element: <NotFound /> },
]);

export default router;
