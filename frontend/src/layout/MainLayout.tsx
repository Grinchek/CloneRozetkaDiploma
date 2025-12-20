import {Outlet} from "react-router";
import Navbar from "../components/Navbar.tsx";

const MainLayout: React.FC = () => {
    return (
        <>
            <Navbar onHomeClick={() => setSelectedCategory(null)} />
            <Outlet />
        </>
    );
}

export default MainLayout;