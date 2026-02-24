import { useState, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useGetProfileQuery, useUpdateProfileMutation, useUploadAvatarMutation, useChangePasswordMutation, useResendConfirmationMutation } from '../../features/account/accountApi';
import { useGetMyOrdersQuery } from '../../features/orders/api/ordersApi';
import { buildAvatarCandidates } from '../../utils/image';
import '../../styles/profile.css';
import '../../styles/account.css';

const TABS = [
    { id: 'profile', label: 'Профіль' },
    { id: 'orders', label: 'Мої замовлення' },
    { id: 'security', label: 'Безпека' },
    { id: 'email', label: 'Email' },
] as const;
type TabId = (typeof TABS)[number]['id'];

const STATUS_LABEL: Record<string, string> = {
    Created: 'Створено',
    Paid: 'Оплачено',
    Shipped: 'Відправлено',
    Completed: 'Виконано',
    Canceled: 'Скасовано',
};

export default function AccountPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = (searchParams.get('tab') as TabId) || 'profile';
    const setTab = (id: TabId) => setSearchParams({ tab: id });

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfileQuery(undefined, { skip: !token });
    const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();
    const [uploadAvatar, { isLoading: uploadingAvatar }] = useUploadAvatarMutation();
    const [changePassword, { isLoading: changingPassword, error: changePasswordError }] = useChangePasswordMutation();
    const [resendConfirmation, { isLoading: resending, isSuccess: resendSuccess }] = useResendConfirmationMutation();

    const { data: orders = [] } = useGetMyOrdersQuery(undefined, { skip: !token || tab !== 'orders' });

    const [editFullName, setEditFullName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editing, setEditing] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const candidates = useMemo(() => buildAvatarCandidates(profile?.avatarUrl ?? undefined), [profile?.avatarUrl]);
    const [avatarIdx, setAvatarIdx] = useState(0);
    const avatarSrc = candidates[avatarIdx];

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    if (!token) {
        window.location.href = '/login';
        return null;
    }

    if (profileLoading && !profile) {
        return (
            <div className="account-page">
                <div className="account-card skeleton" style={{ minHeight: 200 }} />
            </div>
        );
    }

    if (profileError || (!profileLoading && !profile)) {
        const is401 = (profileError as { status?: number })?.status === 401;
        return (
            <div className="account-page account-page--center">
                <div className="profile-card profile-card--error">
                    <p className="profile-error-title">{is401 ? 'Сесія завершена' : 'Помилка завантаження'}</p>
                    <Link to={is401 ? '/login' : '/'} className="profile-btn profile-btn--primary">{(is401 ? 'Увійти' : 'На головну')}</Link>
                </div>
            </div>
        );
    }

    const startEdit = () => {
        setEditFullName(profile?.fullName ?? '');
        setEditPhone(profile?.phoneNumber ?? '');
        setEditing(true);
    };

    const saveProfile = async () => {
        try {
            await updateProfile({ fullName: editFullName || undefined, phoneNumber: editPhone || undefined }).unwrap();
            setEditing(false);
        } catch {
            // error shown by RTK
        }
    };

    const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        try {
            await uploadAvatar(fd).unwrap();
        } catch {
            // error
        }
        e.target.value = '';
    };

    const submitChangePassword = async () => {
        if (newPassword !== confirmPassword) return;
        try {
            await changePassword({ currentPassword, newPassword }).unwrap();
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch {
            // error
        }
    };

    const backendErrors = (changePasswordError as { data?: { errors?: string[] } })?.data?.errors;

    return (
        <div className="account-page">
            <div className="account-card">
                <div className="account-tabs">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            type="button"
                            className={'account-tab' + (tab === t.id ? ' account-tab--active' : '')}
                            onClick={() => setTab(t.id)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="account-content">
                    {tab === 'profile' && (
                        <div className="account-section">
                            <div className="profile-header">
                                <div
                                    className="profile-avatar account-avatar-clickable"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => fileInputRef.current?.click()}
                                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="account-avatar-input"
                                        onChange={onAvatarChange}
                                        disabled={uploadingAvatar}
                                    />
                                    {avatarSrc ? (
                                        <img
                                            src={avatarSrc}
                                            alt=""
                                            onError={() => setAvatarIdx((i) => (i + 1 < candidates.length ? i + 1 : i))}
                                        />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {(profile?.fullName ?? profile?.email ?? 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    {uploadingAvatar && <span className="account-avatar-loading">...</span>}
                                </div>
                                <div className="profile-main-info">
                                    <h1 className="profile-name">{profile?.fullName || profile?.userName || profile?.email || 'Користувач'}</h1>
                                    <p className="profile-email">{profile?.email}</p>
                                    {profile?.phoneNumber && <p className="profile-email">{profile.phoneNumber}</p>}
                                    {profile?.role && <span className="badge badge-role">{profile.role}</span>}
                                </div>
                            </div>

                            {!editing ? (
                                <div className="account-actions">
                                    <button type="button" className="profile-btn" onClick={startEdit}>Редагувати</button>
                                </div>
                            ) : (
                                <div className="account-form">
                                    <label>
                                        <span>Ім'я</span>
                                        <input
                                            type="text"
                                            value={editFullName}
                                            onChange={(e) => setEditFullName(e.target.value)}
                                            placeholder="Повне ім'я"
                                        />
                                    </label>
                                    <label>
                                        <span>Телефон</span>
                                        <input
                                            type="text"
                                            value={editPhone}
                                            onChange={(e) => setEditPhone(e.target.value)}
                                            placeholder="+380..."
                                        />
                                    </label>
                                    <div className="account-form-actions">
                                        <button type="button" className="profile-btn" onClick={() => setEditing(false)}>Скасувати</button>
                                        <button type="button" className="profile-btn profile-btn--primary" onClick={saveProfile} disabled={updating}>Зберегти</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'orders' && (
                        <div className="account-section">
                            <h2 className="account-section-title">Мої замовлення</h2>
                            {orders.length === 0 ? (
                                <p className="muted">У вас ще немає замовлень.</p>
                            ) : (
                                <ul className="account-orders-list">
                                    {orders.map((order) => (
                                        <li key={order.id} className="account-order-item">
                                            <div>
                                                <Link to={`/orders/${order.id}`} className="account-order-link">№ {order.id}</Link>
                                                <span className="account-order-meta">
                                                    {new Date(order.createdAt).toLocaleDateString('uk-UA')} · {STATUS_LABEL[order.status] ?? order.status} · {order.itemsCount} шт.
                                                </span>
                                            </div>
                                            <span className="account-order-total">{order.totalPrice.toLocaleString('uk-UA')} ₴</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <Link to="/orders" className="profile-link">Всі замовлення →</Link>
                        </div>
                    )}

                    {tab === 'security' && (
                        <div className="account-section">
                            <h2 className="account-section-title">Зміна пароля</h2>
                            <div className="account-form">
                                <label>
                                    <span>Поточний пароль</span>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        autoComplete="current-password"
                                    />
                                </label>
                                <label>
                                    <span>Новий пароль</span>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        autoComplete="new-password"
                                    />
                                </label>
                                <label>
                                    <span>Підтвердіть новий пароль</span>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                    />
                                </label>
                                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                    <p className="account-error">Паролі не збігаються.</p>
                                )}
                                {backendErrors?.length ? (
                                    <ul className="account-error-list">
                                        {backendErrors.map((err, i) => (
                                            <li key={i} className="account-error">{err}</li>
                                        ))}
                                    </ul>
                                ) : null}
                                <button
                                    type="button"
                                    className="profile-btn profile-btn--primary"
                                    onClick={submitChangePassword}
                                    disabled={changingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
                                >
                                    {changingPassword ? 'Зміна...' : 'Змінити пароль'}
                                </button>
                            </div>
                            <div className="profile-actions" style={{ marginTop: 24 }}>
                                <button type="button" onClick={handleLogout} className="profile-btn profile-btn--logout">Вийти</button>
                            </div>
                        </div>
                    )}

                    {tab === 'email' && (
                        <div className="account-section">
                            <h2 className="account-section-title">Підтвердження email</h2>
                            <p className="profile-email">{profile?.email}</p>
                            <div className="profile-badges">
                                <span className={'badge ' + (profile?.isEmailConfirmed ? 'badge-success' : 'badge-warning')}>
                                    {profile?.isEmailConfirmed ? 'Email підтверджено' : 'Email не підтверджено'}
                                </span>
                            </div>
                            {!profile?.isEmailConfirmed && (
                                <>
                                    <p className="muted">Натисніть, щоб надіслати лист із посиланням для підтвердження.</p>
                                    <button
                                        type="button"
                                        className="profile-btn profile-btn--primary"
                                        onClick={() => resendConfirmation()}
                                        disabled={resending}
                                    >
                                        {resending ? 'Надсилання...' : resendSuccess ? 'Лист надіслано' : 'Надіслати лист повторно'}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
