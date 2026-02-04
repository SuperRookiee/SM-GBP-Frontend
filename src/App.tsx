import { Route, Routes } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout.tsx";
import NotFound from "@/components/errors/NotFound.tsx";
import DemoChartPage from "@/pages/demo/chart/DemoChartPage.tsx";
import DemoFormPage from "@/pages/demo/form/DemoFormPage.tsx";
import DemoGridPage from "@/pages/demo/grid/DemoGridPage.tsx";
import IndexPage from "@/pages/demo/index/IndexPage.tsx";
import LoginPage from "@/pages/login/LoginPage.tsx";
import AuthRouter from "@/routes/AuthRouter.tsx";

const App = () => {
    return (
        <Routes>
            {/* 공개 Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* 보호 Route */}
            <Route element={<AuthRouter />}>
                <Route path="/" element={<MainLayout/>}>
                    <Route index element={<IndexPage/>}/>

                    {/* Demo*/}
                    <Route path='/demo'>
                        <Route path="index" element={<IndexPage/>}/>
                        <Route path="grid" element={<DemoGridPage/>}/>
                        <Route path="chart" element={<DemoChartPage/>}/>
                        <Route path="form" element={<DemoFormPage/>}/>
                    </Route>

                    {/* Error */}
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;
