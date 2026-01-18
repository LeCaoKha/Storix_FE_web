import { createBrowserRouter } from "react-router-dom";
import App from "../App";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      //   { index: true, element: <Explore /> },
      //
      //   { path: "*", element: <NotFound /> },
    ],
  },
  //   { path: "login", element: <Login /> },
  //   { path: "signup", element: <Register /> },
  //   { path: "*", element: <NotFound /> },
]);

export default router;
