import { createBrowserRouter, RouterProvider } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import Error from "@/screens/Error";
import Home from "@/screens/Home";
import Play from "@/screens/Play";

const router = createBrowserRouter(
  [
    {
      element: <MainLayout />,
      errorElement: <Error />,
      children: [
        { index: true, Component: Home },
        { path: "play", Component: Play },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL || "/" },
);

export default function Router() {
  return <RouterProvider router={router} />;
}
