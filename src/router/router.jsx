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
import InboundManagement from "../pages/CompanyAdmin/components/InboundManagement/InboundManagement";
import OutboundManagement from "../pages/CompanyAdmin/components/OutboundManagement/OutboundManagement";
import ProductManagement from "../pages/CompanyAdmin/components/ProductManagement/ProductManagement";
import ReportManagement from "../pages/CompanyAdmin/components/ReportManagement/ReportManagement";
import WarehouseManagement from "../pages/CompanyAdmin/components/WarehouseManagement/WarehouseManagement";

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
      { path: "inbound-management", element: <InboundManagement /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "outbound-management", element: <OutboundManagement /> },
      { path: "product-management", element: <ProductManagement /> },
      { path: "report-management", element: <ReportManagement /> },
      { path: "account-management", element: <AccountManagement /> },
      { path: "warehouse-management", element: <WarehouseManagement /> },
      // { path: "*", element: <NotFound /> },
    ],
  },
  { path: "warehouse-config", element: <WarehouseConfig /> },
  { path: "auth", element: <AuthPage /> },
  { path: "*", element: <NotFound /> },
]);

export default router;
