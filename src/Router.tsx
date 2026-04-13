import { createBrowserRouter, RouterProvider } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import Error from "@/screens/Error";
import Home from "@/screens/Home";

const router = createBrowserRouter(
  [
    {
      element: <MainLayout />,
      errorElement: <Error />,
      children: [{ index: true, Component: Home }],
    },
  ],
  { basename: import.meta.env.BASE_URL || "/" },
);

export default function Router() {
  return <RouterProvider router={router} />;
}
