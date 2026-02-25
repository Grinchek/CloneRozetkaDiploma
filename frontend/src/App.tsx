import "./styles.css";
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import AccountPage from "./pages/AccountPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ConfirmEmailPage from "./pages/ConfirmEmailPage";
import RequireAdmin from './components/RequireAdmin';
import RequireAuth from './components/RequireAuth';


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
import AdminOrders from "./admin/components/ecommerce/AdminOrders.tsx";
import AdminOrderDetails from "./admin/components/ecommerce/AdminOrderDetails.tsx";
import AdminCarts from "./admin/components/ecommerce/AdminCarts.tsx";
import AdminCartDetails from "./admin/components/ecommerce/AdminCartDetails.tsx";
import AdminAttributes from "./admin/components/ecommerce/AdminAttributes.tsx";

import ProductPage from "./pages/ProductPage/index.tsx";
import CartPage from "./pages/CartPage/index.tsx";
import FavoritesPage from "./pages/FavoritesPage/index.tsx";
import ComparePage from "./pages/ComparePage/index.tsx";
import CatalogPage from "./pages/CatalogPage/index.tsx";
import CheckoutPage from "./pages/CheckoutPage/index.tsx";
import OrdersPage from "./pages/OrdersPage/index.tsx";
import OrderDetailsPage from "./pages/OrderDetailsPage/index.tsx";


export default function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="login" element={<SignIn />} />
                    <Route element={<RequireAuth />}>
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="account" element={<AccountPage />} />
                    </Route>
                    <Route path="forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="reset-password" element={<ResetPasswordPage />} />
                    <Route path="confirm-email" element={<ConfirmEmailPage />} />
                    <Route path="product/:id" element={<ProductPage />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="favorites" element={<FavoritesPage />} />
                    <Route path="compare" element={<ComparePage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="orders/:id" element={<OrderDetailsPage />} />
                    <Route path="category/:id" element={<CatalogPage />} />
                </Route>
                <Route element={<RequireAdmin />}>
                    <Route path="admin" element={<AppLayout />}>
                        <Route index element={<Home />} />

                        {/* Others Page */}
                        <Route path="registered-users" element={<RegisteredUsers />} />
                        <Route path="admin-categories" element={<AdminCategories />} />
                        <Route path="admin-products" element={<AdminProducts />} />
                        <Route path="attributes" element={<AdminAttributes />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="orders/:id" element={<AdminOrderDetails />} />
                        <Route path="carts" element={<AdminCarts />} />
                        <Route path="carts/:userId" element={<AdminCartDetails />} />
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

        </>

    );
}
