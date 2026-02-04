import { Route, Routes } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import GridPage from "@/pages/demo/grid/GridPage.tsx";
import IndexPage from "@/pages/demo/index/IndexPage.tsx";

const App = () => {
    return (
        <Routes>
            {/* LNB */}
            <Route path="/" element={<RootLayout/>}>
                <Route index element={<IndexPage/>}/>
                <Route path='/demo'>
                    <Route path="grid" element={<GridPage/>}/>
                </Route>
            </Route>
        </Routes>
    );
}

export default App;