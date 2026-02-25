import {Route, Routes} from "react-router-dom";
import MainLayout from "@/layouts/Main.layout.tsx";
import PublicLayout from "@/layouts/Public.layout.tsx";
import NotFound from "@/components/errors/NotFound.tsx";
import AdminListPage from "@/pages/admin_settings/AdminListPage.tsx";
import AdminNoticePage from "@/pages/admin_settings/AdminNoticePage.tsx";
import AdminPermissionInfoPage from "@/pages/admin_settings/AdminPermissionInfoPage.tsx";
import DashboardPage from "@/pages/dashboard/DashboardPage.tsx";
import DemoApiPage from "@/pages/demo/api/DemoApiPage.tsx";
import SampleDetailPage from "@/pages/demo/api/SampleDetailPage.tsx";
import DemoChartPage from "@/pages/demo/chart/DemoChartPage.tsx";
import DemoDialogPage from "@/pages/demo/dialog/DemoDialogPage.tsx";
import DemoEditorPage from "@/pages/demo/editor/DemoEditorPage.tsx";
import DemoFormPage from "@/pages/demo/form/DemoFormPage.tsx";
import DemoImagePage from "@/pages/demo/image/DemoImagePage.tsx";
import DemoDataTablePage from "@/pages/demo/table/DemoDataTablePage.tsx";
import DemoGridTablePage from "@/pages/demo/table/DemoGridTablePage.tsx";
import DemoTypography from "@/pages/demo/typography/DemoTypography.tsx";
import ForgotPasswordPage from "@/pages/forgot_password/ForgotPasswordPage.tsx";
import LoginPage from "@/pages/login/LoginPage.tsx";
import MyPage from "@/pages/my_page/MyPage.tsx";
import SignupPage from "@/pages/sign_up/SignupPage.tsx";
import UserDetailPage from "@/pages/user/detail/UserDetailPage.tsx";
import UserPage from "@/pages/user/UserPage.tsx";
import AuthRouter from "@/routes/AuthRouter.tsx";

const App = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout/>}>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/forgot_password" element={<ForgotPasswordPage/>}/>
                <Route path="/sign_up" element={<SignupPage/>}/>
            </Route>

            {/* Protected Routes */}
            <Route element={<AuthRouter/>}>
                <Route path="/" element={<MainLayout/>}>
                    <Route index element={<DashboardPage/>}/>

                    {/* 관리자 설정 */}
                    <Route path="/admin_settings">
                        <Route path="list" element={<AdminListPage/>}/>
                        <Route path="permission_register" element={<AdminPermissionInfoPage/>}/>
                        <Route path="notice" element={<AdminNoticePage/>}/>
                    </Route>

                    {/* Demo */}
                    <Route path="/demo">
                        <Route path="data_table" element={<DemoDataTablePage/>}/>
                        <Route path="grid_table" element={<DemoGridTablePage/>}/>
                        <Route path="chart" element={<DemoChartPage/>}/>
                        <Route path="grid_table" element={<DemoGridTablePage/>}/>
                        <Route path="form" element={<DemoFormPage/>}/>
                        <Route path="dialog" element={<DemoDialogPage/>}/>
                        <Route path="api" element={<DemoApiPage/>}/>
                        <Route path="api/new" element={<SampleDetailPage/>}/>
                        <Route path="api/:id" element={<SampleDetailPage/>}/>
                        <Route path="typography" element={<DemoTypography/>}/>
                        <Route path="editor" element={<DemoEditorPage/>}/>
                        <Route path="image" element={<DemoImagePage/>}/>
                    </Route>

                    <Route path="/user">
                        <Route index element={<UserPage />} />
                        <Route path=":id" element={<UserDetailPage />} />
                    </Route>

                    {/* 마이페이지 */}
                    <Route path="/my_page" element={<MyPage/>}/>

                    <Route path="*" element={<NotFound/>}/>
                </Route>
            </Route>
        </Routes>
    );
};

export default App;
