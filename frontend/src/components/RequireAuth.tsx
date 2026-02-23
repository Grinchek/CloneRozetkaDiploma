import { Navigate, useLocation, Outlet } from 'react-router-dom';

/**
 * Protected route: only for authenticated users.
 * If no token — redirect to /login.
 */
const RequireAuth = () => {
    const location = useLocation();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default RequireAuth;
