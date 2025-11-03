import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import {BrowserRouter} from "react-router-dom";
import {GoogleOAuthProvider} from "@react-oauth/google";


ReactDOM.createRoot(document.getElementById("root")!).render(
    <>
        <GoogleOAuthProvider clientId="961565805705-iaof6kacksmgddrm0d6j3u80ospvm88b.apps.googleusercontent.com">
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </GoogleOAuthProvider>
    </>
);
