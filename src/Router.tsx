import { createHashRouter, RouterProvider } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import Error from "@/screens/Error";
import Home from "@/screens/Home";
import Start from "@/screens/Start";
import Battle from "@/screens/Battle";
import BonusUpgrade from "@/screens/BonusUpgrade";
import DevilDeal from "@/screens/DevilDeal";
import Leaderboard from "@/screens/Leaderboard";

const router = createHashRouter([
  {
    element: <MainLayout />,
    errorElement: <Error />,
    children: [
      { index: true, Component: Home },
      { path: "start", Component: Start },
      { path: "battle", Component: Battle },
      { path: "bonus-upgrade", Component: BonusUpgrade },
      { path: "devil-deal", Component: DevilDeal },
      { path: "leaderboard", Component: Leaderboard },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
