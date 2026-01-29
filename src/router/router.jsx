import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import NotFound from "../pages/NotFound/NotFound";
import AuthPage from "../pages/AuthPage/AuthPage";
import WarehouseConfig from "../pages/WarehouseConfig/WarehouseConfig";
import LandingPage from "../pages/LandingPage/LandingPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      // { path: "*", element: <NotFound /> },
    ],
  },
  { path: "warehouse-config", element: <WarehouseConfig /> },
  { path: "auth", element: <AuthPage /> },
  { path: "*", element: <NotFound /> },
]);

export default router;
