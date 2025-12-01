import "./styles.css";
import {Route, Routes} from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from './pages/AdminPage';
import RequireAdmin from './components/RequireAdmin';
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer";




export default function App() {
    return (
        <>
            <Navbar onHomeClick={() => setSelectedCategory(null)} />
            <Routes>
                <Route path="/">
                    <Route index element={<HomePage/>}/>

                    <Route path={"login"} element={<LoginPage/>}/>
                    <Route path="/profile" element={<ProfilePage />} />
                </Route>
                <Route
                    path="/admin"
                    element={
                        <RequireAdmin>
                            <AdminPage />
                        </RequireAdmin>
                    }
                />
            </Routes>
            <Footer />
        </>

    );
}
