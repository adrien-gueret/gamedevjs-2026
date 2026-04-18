import { createBrowserRouter, RouterProvider } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import Error from "@/screens/Error";
import Home from "@/screens/Home";
import Start from "@/screens/Start";
import Battle from "@/screens/Battle";
import BonusUpgrade from "@/screens/BonusUpgrade";

const router = createBrowserRouter(
  [
    {
      element: <MainLayout />,
      errorElement: <Error />,
      children: [
        { index: true, Component: Home },
        { path: "start", Component: Start },
        { path: "battle", Component: Battle },
        { path: "bonus-upgrade", Component: BonusUpgrade },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL || "/" },
);

export default function Router() {
  return <RouterProvider router={router} />;
}
