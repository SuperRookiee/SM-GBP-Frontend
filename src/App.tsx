import { Route, Routes } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import GridPage from "@/pages/grid/GridPage.tsx";
import HomePage from "@/pages/HomePage";

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