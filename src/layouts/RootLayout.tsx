import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <Outlet />
    </div>
  );
};

export default RootLayout;
