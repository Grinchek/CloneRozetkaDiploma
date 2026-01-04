import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useMeQuery } from '../features/account/apiAccount';

const RequireAdmin = () => {
    const location = useLocation();
    const token = localStorage.getItem('token');

    const { data: me, isLoading } = useMeQuery(undefined, {
        skip: !token,
    });

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (isLoading) {
        return <div style={{ padding: 24 }}>Завантаження...</div>;
    }

    if (!me || me.role !== 'Admin') {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RequireAdmin;
