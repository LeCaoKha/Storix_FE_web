import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import NotFound from "../pages/NotFound/NotFound";
import AuthPage from "../pages/AuthPage/AuthPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      //   { index: true, element: <Explore /> },
      //
      // { path: "*", element: <NotFound /> },
    ],
  },
  { path: "auth", element: <AuthPage /> },
  { path: "*", element: <NotFound /> },
]);

export default router;
