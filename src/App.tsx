import { Route, Routes } from "react-router-dom";
import MainLayout from "@/layouts/Main.layout.tsx";
import NotFound from "@/components/errors/NotFound.tsx";
import DemoChartPage from "@/pages/demo/chart/DemoChartPage.tsx";
import DemoDataTablePage from "@/pages/demo/data_table/DemoDataTablePage.tsx";
import DemoDialogPage from "@/pages/demo/dialog/DemoDialogPage.tsx";
import DemoFormPage from "@/pages/demo/form/DemoFormPage.tsx";
import IndexPage from "@/pages/demo/index/IndexPage.tsx";
import LoginPage from "@/pages/login/LoginPage.tsx";
import UserPage from "@/pages/user/UserPage.tsx";
import AuthRouter from "@/routes/AuthRouter.tsx";

const App = () => {
    return (
        <Routes>
            {/* 공개 Route */}
            <Route path="/login" element={<LoginPage/>}/>

            {/* 보호 Route */}
            <Route element={<AuthRouter/>}>
                <Route path="/" element={<MainLayout/>}>
                    <Route index element={<IndexPage/>}/>

                    {/* Demo*/}
                    <Route path='/demo'>
                        <Route path="index" element={<IndexPage/>}/>
                        <Route path="data_table" element={<DemoDataTablePage/>}/>
                        <Route path="chart" element={<DemoChartPage/>}/>
                        <Route path="form" element={<DemoFormPage/>}/>
                        <Route path="dialog" element={<DemoDialogPage/>}/>
                    </Route>

                    <Route path='/user' element={<UserPage/>}/>

                    {/* Error */}
                    <Route path="*" element={<NotFound/>}/>
                </Route>
            </Route>
        </Routes>
    );
}

export default App;

