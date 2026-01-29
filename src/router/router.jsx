import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import NotFound from "../pages/NotFound/NotFound";
import AuthPage from "../pages/AuthPage/AuthPage";
import WarehouseConfig from "../pages/WarehouseConfig/WarehouseConfig";
import LandingPage from "../pages/LandingPage/LandingPage";
import AboutPage from "../pages/About/About";
import ExplorePage from "../pages/Explore/Explore";
import ContactPage from "../pages/Contact/Contact";

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
  { path: "warehouse-config", element: <WarehouseConfig /> },
  { path: "auth", element: <AuthPage /> },
  { path: "*", element: <NotFound /> },
]);

export default router;
