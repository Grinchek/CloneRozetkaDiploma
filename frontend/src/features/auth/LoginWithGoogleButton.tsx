// src/features/auth/LoginWithGoogle.tsx
import { API_BASE, FRONT_CALLBACK } from "../../config";


export default function LoginWithGoogle() {
  const handleClick = () => {
    const url =
      `${API_BASE}/api/auth/external-login/google?` +
      `returnUrl=${encodeURIComponent(FRONT_CALLBACK)}`;
    window.location.href = url;
  };

  return (
    <button onClick={handleClick}>
      Увійти через Google
    </button>
  );
}
