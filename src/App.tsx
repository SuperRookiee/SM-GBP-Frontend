import { Route, Routes } from "react-router-dom";

import RootLayout from "@/layouts/RootLayout";
import HomePage from "@/pages/HomePage";
import GridPage from "@/pages/grid/GridPage.tsx";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<HomePage />} />
        <Route path="grid" element={<GridPage />} />
      </Route>
    </Routes>
  );
}

export default App;