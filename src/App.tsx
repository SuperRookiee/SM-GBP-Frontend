import { BrowserRouter, Route, Routes } from "react-router-dom";

import RootLayout from "@/layouts/RootLayout";
import HomePage from "@/pages/HomePage";
import ChartPage from "@/pages/grid/ChartPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="grid" element={<ChartPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;