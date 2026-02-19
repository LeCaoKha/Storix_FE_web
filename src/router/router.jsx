import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import NotFound from "../pages/NotFound/NotFound";
import AuthPage from "../pages/AuthPage/AuthPage";
import WarehouseConfig from "../pages/WarehouseConfig/WarehouseConfig";
import LandingPage from "../pages/LandingPage/LandingPage";
import AboutPage from "../pages/About/About";
import ExplorePage from "../pages/Explore/Explore";
import ContactPage from "../pages/Contact/Contact";
import CompanyAdmin from "../pages/CompanyAdmin/CompanyAdmin";
import AccountManagement from "../pages/CompanyAdmin/components/AccountManagement/AccountManagement";
import Dashboard from "../pages/CompanyAdmin/components/Dashboard/Dashboard";
import InboundTicketManagement from "../pages/CompanyAdmin/components/InboundTicketManagement/InboundTicketManagement";
import InboundTicketCreate from "../pages/CompanyAdmin/components/InboundTicketManagement/components/InboundTicketCreate/InboundTicketCreate";
import OutboundManagement from "../pages/CompanyAdmin/components/OutboundManagement/OutboundManagement";
import ProductManagement from "../pages/CompanyAdmin/components/ProductManagement/ProductManagement";
import ReportManagement from "../pages/CompanyAdmin/components/ReportManagement/ReportManagement";
import WarehouseManagement from "../pages/CompanyAdmin/components/WarehouseManagement/WarehouseManagement";
import WarehouseConfiguration from "../pages/CompanyAdmin/components/WarehouseManagement/components/WarehouseConfiguration/WarehouseConfiguration";
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/explore", element: <ExplorePage /> },
      { path: "/contact", element: <ContactPage /> },

      // { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "/company-admin",
    element: <CompanyAdmin />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      // OUTBOUND MANAGEMENT
      { path: "outbound-management", element: <OutboundManagement /> },
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
      {
        path: "account-management/details/:id",
        element: <AccountDetails />,
      },
      // INBOUND REQUEST MANAGEMENT
      {
        path: "inbound-request-management",
        element: <InboundRequestManagement />,
      },
      {
        path: "inbound-request-management/details/:id",
        element: <InboundRequestDetails />,
      },
      {
        path: "inbound-request-management/create",
        element: <InboundRequestCreate />,
      },
      // INBOUND TICKET MANAGEMENT
      {
        path: "inbound-ticket-management",
        element: <InboundTicketManagement />,
      },
      {
        path: "inbound-ticket-management/create/:id",
        element: <InboundTicketCreate />,
      },
      // SUPPLIER MANAGEMENT
      { path: "supplier-management", element: <SupplierManagement /> },
      // WAREHOUSE MANAGEMENT
      { path: "warehouse-management", element: <WarehouseManagement /> },
      // PROFILE MANAGEMENT
      { path: "profile/:id", element: <Profile /> },
      { path: "profile/:id/edit", element: <EditProfile /> },
    ],
  },
  {
    path: "company-admin/warehouse-configuration",
    element: <WarehouseConfiguration />,
  },
  { path: "profile", element: <Profile /> },
  { path: "warehouse-config", element: <WarehouseConfig /> },
  { path: "auth", element: <AuthPage /> },
  { path: "*", element: <NotFound /> },
]);

export default router;
