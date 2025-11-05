// src/pages/auth/callback.tsx
import { useEffect } from "react";

export default function GoogleCallbackPage() {
  useEffect(() => {
    // Якщо бек редіректить з hash:  https://localhost:5173/auth/callback#token=...&exp=...
    const hash = new URL(window.location.href).hash; // "#token=...&exp=..."
    if (hash?.startsWith("#")) {
      const params = new URLSearchParams(hash.slice(1));
      const token = params.get("token");
      const exp = params.get("exp");
      if (token) {
        localStorage.setItem("access_token", token);
        if (exp) localStorage.setItem("access_token_exp", exp);
      }
      // перекинути на головну
      window.location.replace("/");
    }
  }, []);

  return <p>Finishing Google login…</p>;
}
