// src/pages/auth/callback.tsx
import { useEffect } from "react";

export default function GoogleCallbackPage() {
  useEffect(() => {
    const hash = new URL(window.location.href).hash;
    if (hash?.startsWith("#")) {
      const params = new URLSearchParams(hash.slice(1));
      const token = params.get("token");
      const exp = params.get("exp");
      if (token) {
        localStorage.setItem("access_token", token);
        if (exp) localStorage.setItem("access_token_exp", exp);
      }

      window.location.replace("/");
    }
  }, []);

  return <p>Finishing Google login…</p>;
}
