import { Route, Routes } from "react-router-dom";
import MainLayout from "@/layouts/Main.layout.tsx";
import NotFound from "@/components/errors/NotFound.tsx";
import DashboardPage from "@/pages/dashboard/DashboardPage.tsx";
import DemoChartPage from "@/pages/demo/chart/DemoChartPage.tsx";
import DemoDialogPage from "@/pages/demo/dialog/DemoDialogPage.tsx";
import DemoFormPage from "@/pages/demo/form/DemoFormPage.tsx";
import DemoDataTablePage from "@/pages/demo/table/DemoDataTablePage.tsx";
import DemoGridTablePage from "@/pages/demo/table/DemoGridTablePage.tsx";
import LoginPage from "@/pages/login/LoginPage.tsx";
import UserDetailPage from "@/pages/user/detail/UserDetailPage.tsx";
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
                    <Route index element={<DashboardPage/>}/>

                    {/* Demo*/}
                    <Route path='/demo'>
                        <Route path="data_table" element={<DemoDataTablePage/>}/>
                        <Route path="grid_table" element={<DemoGridTablePage/>}/>
                        <Route path="chart" element={<DemoChartPage/>}/>
                        <Route path="grid_table" element={<DemoGridTablePage/>}/>
                        <Route path="form" element={<DemoFormPage/>}/>
                        <Route path="dialog" element={<DemoDialogPage/>}/>
                    </Route>

                    <Route path="/user">
                        <Route index element={<UserPage />} />
                        <Route path=":id" element={<UserDetailPage />} />
                    </Route>

                    {/* Error */}
                    <Route path="*" element={<NotFound/>}/>
                </Route>
            </Route>
        </Routes>
    );
}

export default App;

