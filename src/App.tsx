import { Route, Routes } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import DemoGridPage from "@/pages/demo/grid/DemoGridPage.tsx";
import IndexPage from "@/pages/demo/index/IndexPage.tsx";

const App = () => {
    return (
        <Routes>
            {/* LNB */}
            <Route path="/" element={<RootLayout/>}>
                <Route index element={<IndexPage/>}/>
                <Route path='/demo'>
                    <Route path={"index"} element={<IndexPage/>}/>
                    <Route path="grid" element={<DemoGridPage/>}/>
                </Route>
            </Route>
        </Routes>
    );
}

export default App;
