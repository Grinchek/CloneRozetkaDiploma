import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/navbar.css";
import "./styles/profile.css";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import { store } from "./store";
import { ThemeProvider } from "./admin/context/ThemeContext.tsx";
import { AppWrapper } from "./admin/components/common/PageMeta.tsx";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;


ReactDOM.createRoot(document.getElementById("root")!).render(
    <ThemeProvider>
        <AppWrapper>
            <Provider store={store}>
                <GoogleOAuthProvider clientId={clientId}>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </GoogleOAuthProvider>
            </Provider>
        </AppWrapper>
    </ThemeProvider>,
);
