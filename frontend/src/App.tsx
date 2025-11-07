import "./styles.css";
import {Route, Routes} from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";



export default function App() {
    return (
        <>
            <Routes>
                <Route path="/">
                    <Route index element={<HomePage/>}/>

                    <Route path={"login"} element={<LoginPage/>}/>

                </Route>
            </Routes>
        </>

    );
}
