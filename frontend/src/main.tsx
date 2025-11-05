import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import {BrowserRouter} from "react-router-dom";
import {GoogleOAuthProvider} from "@react-oauth/google";


ReactDOM.createRoot(document.getElementById("root")!).render(
    <>
        <GoogleOAuthProvider clientId="688315354046-isd3q5qkjaj88uaj9oudrldsf18bm592.apps.googleusercontent.com">
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </GoogleOAuthProvider>
    </>
);
