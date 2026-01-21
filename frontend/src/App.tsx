import "./styles.css";
import {Route, Routes} from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import ProfilePage from "./pages/ProfilePage";
// import AdminPage from './pages/AdminPage';
 import RequireAdmin from './components/RequireAdmin';
// import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer";
import AppLayout from "./admin/layout/AppLayout.tsx";
import Home from "./admin/pages/Dashboard/Home.tsx";
import UserProfiles from "./admin/pages/UserProfiles.tsx";
import Calendar from "./admin/pages/Calendar.tsx";
import Blank from "./admin/pages/Blank.tsx";
import FormElements from "./admin/pages/Forms/FormElements.tsx";
import BasicTables from "./admin/pages/Tables/BasicTables.tsx";
import Alerts from "./admin/pages/UiElements/Alerts.tsx";
import Avatars from "./admin/pages/UiElements/Avatars.tsx";
import Badges from "./admin/pages/UiElements/Badges.tsx";
import Buttons from "./admin/pages/UiElements/Buttons.tsx";
import Images from "./admin/pages/UiElements/Images.tsx";
import Videos from "./admin/pages/UiElements/Videos.tsx";
import LineChart from "./admin/pages/Charts/LineChart.tsx";
import BarChart from "./admin/pages/Charts/BarChart.tsx";
import SignIn from "./admin/pages/AuthPages/SignIn.tsx";
import SignUp from "./admin/pages/AuthPages/SignUp.tsx";
import NotFound from "./admin/pages/OtherPage/NotFound.tsx";
import MainLayout from "./layout/MainLayout.tsx";
import RegisteredUsers from "./admin/components/ecommerce/RegisteredUsers.tsx";
import AdminCategories from "./admin/components/ecommerce/AdminCategories.tsx";
import AdminProducts from "./admin/components/ecommerce/AdminProducts.tsx";




export default function App() {
    return (
        <>
            {/*<Navbar onHomeClick={() => setSelectedCategory(null)} />*/}
            <Routes>
                <Route path="/" element={<MainLayout/>}>
                    <Route index element={<HomePage/>}/>

                    <Route path={"login"} element={<LoginPage/>}/>
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>
                <Route element={<RequireAdmin />}>
                <Route  path="admin"  element={<AppLayout />}>
                    <Route index element={<Home />} />

                    {/* Others Page */}
                    <Route path="registered-users" element={<RegisteredUsers />} />
                    <Route path="admin-categories" element={<AdminCategories />} />
                    <Route path="admin-products" element={<AdminProducts />} />
                     <Route path="profile" element={<UserProfiles />} />
                    <Route path="calendar" element={<Calendar />} />
                    <Route path="blank" element={<Blank />} />

                    {/* Forms */}
                    <Route path="form-elements" element={<FormElements />} />

                    {/* Tables */}
                    <Route path="basic-tables" element={<BasicTables />} />

                    {/* Ui Elements */}
                    <Route path="alerts" element={<Alerts />} />
                    <Route path="avatars" element={<Avatars />} />
                    <Route path="badge" element={<Badges />} />
                    <Route path="buttons" element={<Buttons />} />
                    <Route path="images" element={<Images />} />
                    <Route path="videos" element={<Videos />} />

                    {/* Charts */}
                    <Route path="line-chart" element={<LineChart />} />
                    <Route path="bar-chart" element={<BarChart />} />
                </Route>
                </Route>

                {/* Auth Layout */}
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />

                {/* Fallback Route */}
                <Route path="*" element={<NotFound />} />

            </Routes>
            <Footer />
        </>

    );
}
