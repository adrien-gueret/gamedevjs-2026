import { Outlet, ScrollRestoration } from "react-router-dom";

function MainLayout() {
  return (
    <>
      <ScrollRestoration />
      <Outlet />
    </>
  );
}

export default MainLayout;
