import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useMeQuery } from '../features/account/apiAccount';

type RequireAdminProps = {
    children: ReactNode;
};

const RequireAdmin = ({ children }: RequireAdminProps) => {
    const location = useLocation();
    const token = localStorage.getItem('token');

    // якщо немає токена — точно не адмін
    const { data: me, isLoading } = useMeQuery(undefined, {
        skip: !token,
    });

    if (!token) {
        // перекидуємо на логін, зберігаємо звідки прийшов
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (isLoading) {
        return <div style={{ padding: 24 }}>Завантаження...</div>;
    }

    // якщо користувач є, але не адмін — додому
    if (!me || me.role !== 'Admin') {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default RequireAdmin;
