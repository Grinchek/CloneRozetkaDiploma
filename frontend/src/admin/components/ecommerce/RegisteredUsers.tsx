import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";

interface PaginationModel {
    totalCount: number;
    totalPages: number;
    itemsPerPage: number;
    currentPage: number;
}

interface AdminUserItemModel {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    emailConfirmed: boolean;
    image?: string | null;
    roles: string[];
}

interface SearchResult<T> {
    items: T[];
    pagination: PaginationModel;
}

const API_URL = import.meta.env.VITE_API_BASE;

export default function RegisteredUsers() {
    const [data, setData] = useState<SearchResult<AdminUserItemModel> | null>(null);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [roleChangingId, setRoleChangingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUserItemModel | null>(null);
    const itemsPerPage = 10;

    const loadUsers = async (pageToLoad: number) => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("token");

            const res = await fetch(
                `${API_URL}/api/User?page=${pageToLoad}&itemsPerPage=${itemsPerPage}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Request failed: ${res.status}`);
            }

            const json = (await res.json()) as SearchResult<AdminUserItemModel>;
            setData(json);
        } catch (e: any) {
            setError(e?.message ?? "Unknown error");
        } finally {
            setLoading(false);
        }
    };
    type AdminUserEditModel = {
        id: string;
        fullName: string;
        email: string;
        phoneNumber?: string | null;
        roles: string[];
        newImageBase64?: string | null;
    };

    const toggleAdmin = async (user: AdminUserItemModel) => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("No token. Please login again.");
            return;
        }

        const isAdmin = user.roles.includes("Admin");
        const nextRoles = isAdmin
            ? user.roles.filter((r) => r !== "Admin")
            : Array.from(new Set([...user.roles, "Admin"]));
        
        const payload: AdminUserEditModel = {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber ?? null,
            roles: nextRoles,
            newImageBase64: null,
        };

        try {
            setRoleChangingId(user.id);
            setError(null);

            const res = await fetch(`${API_URL}/api/User/change-role`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    accept: "*/*",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Change role failed: ${res.status}`);
            }

            // ✅ оновлюємо roles в UI локально
            setData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    items: prev.items.map((u) =>
                        u.id === user.id ? { ...u, roles: nextRoles } : u
                    ),
                };
            });
        } catch (e: any) {
            setError(e?.message ?? "Unknown error");
        } finally {
            setRoleChangingId(null);
        }
    };


    const askDelete = (user: AdminUserItemModel) => {
        setSelectedUser(user);
        setConfirmOpen(true);
    };

    const closeConfirm = () => {
        if (deletingId) return; // не даємо закрити під час delete
        setConfirmOpen(false);
        setSelectedUser(null);
    };

    const confirmDelete = async () => {
        if (!selectedUser) return;

        const token = localStorage.getItem("token");
        if (!token) {
            setError("No token. Please login again.");
            closeConfirm();
            return;
        }

        try {
            setDeletingId(selectedUser.id);
            setError(null);

            const res = await fetch(`${API_URL}/api/User/${selectedUser.id}`, {
                method: "DELETE",
                headers: {
                    accept: "*/*",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Delete failed: ${res.status}`);
            }

            // ✅ прибираємо юзера зі списку
            setData((prev) => {
                if (!prev) return prev;

                const nextItems = prev.items.filter((u) => u.id !== selectedUser.id);
                const nextTotalCount = Math.max(0, prev.pagination.totalCount - 1);

                return {
                    ...prev,
                    items: nextItems,
                    pagination: {
                        ...prev.pagination,
                        totalCount: nextTotalCount,
                    },
                };
            });

            // ✅ якщо сторінка стала пустою — відкотимось
            setTimeout(() => {
                setData((prev) => {
                    if (!prev) return prev;
                    if (prev.items.length === 0 && page > 1) setPage((p) => p - 1);
                    return prev;
                });
            }, 0);

            setConfirmOpen(false);
            setSelectedUser(null);
        } catch (e: any) {
            setError(e?.message ?? "Unknown error");
        } finally {
            setDeletingId(null);
        }
    };


    useEffect(() => {
        loadUsers(page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const users = data?.items ?? [];

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Registered Users
                    </h3>
                    {data && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total: {data.pagination.totalCount}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                        onClick={() => loadUsers(page)}
                    >
                        Refresh
                    </button>

                    <button
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                        onClick={() => setPage(1)}
                    >
                        See all
                    </button>
                </div>
            </div>

            {loading && (
                <div className="py-6 text-gray-500 dark:text-gray-400">Loading...</div>
            )}
            {error && <div className="py-6 text-red-600">Error: {error}</div>}

            {!loading && !error && (
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    User
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    Email
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    Phone Number
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    Verified Email
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    Role
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                                >
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {users.map((user) => {
                                const isAdmin = user.roles.includes("Admin");
                                const avatarSrc = user.image
                                    ? `${API_URL}/${user.image}`
                                    : "/images/user/default-avatar.png";

                                return (
                                    <TableRow key={user.id}>
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800">
                                                    <img
                                                        src={avatarSrc}
                                                        className="h-[50px] w-[50px] object-cover"
                                                        alt={user.fullName}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                                                        {user.fullName}
                                                    </p>
                                                    <span className="text-theme-xs text-gray-500 dark:text-gray-400">
                            ID: {user.id}
                          </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                            {user.email}
                                        </TableCell>

                                        <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                            {user.phoneNumber || "-"}
                                        </TableCell>

                                        <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                            <Badge size="sm" color={user.emailConfirmed ? "success" : "error"}>
                                                {user.emailConfirmed ? "Verified" : "Not verified"}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="py-3">
                                            <button
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition ${
                                                    isAdmin
                                                        ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/10 dark:text-red-400"
                                                        : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/10 dark:text-blue-400"
                                                } disabled:opacity-50`}
                                                onClick={() => toggleAdmin(user)}
                                                disabled={roleChangingId === user.id}
                                                title={isAdmin ? "Зняти роль Admin" : "Надати роль Admin"}
                                            >
                                                {roleChangingId === user.id ? "Saving..." : isAdmin ? "Remove admin" : "Make admin"}
                                            </button>

                                        </TableCell>

                                        <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                                            <button
                                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                                                onClick={() => askDelete(user)}
                                                disabled={deletingId === user.id}
                                            >
                                                {deletingId === user.id ? "Deleting..." : "Delete"}
                                            </button>

                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {users.length === 0 && (
                                <TableRow>
                                    <TableCell className="py-6 text-gray-500 dark:text-gray-400">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {data && data.pagination.totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <button
                                className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Prev
                            </button>

                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Page {data.pagination.currentPage} / {data.pagination.totalPages}
                            </div>

                            <button
                                className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
                                disabled={page >= data.pagination.totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
            <ConfirmModal
                open={confirmOpen}
                title="Delete user?"
                description={
                    selectedUser
                        ? `Are you sure you want to delete "${selectedUser.fullName}" (${selectedUser.email})? This action cannot be undone.`
                        : "This action cannot be undone."
                }
                confirmText="Delete"
                cancelText="Cancel"
                loading={!!deletingId}
                onClose={closeConfirm}
                onConfirm={confirmDelete}
            />

        </div>
    );
}
type ConfirmModalProps = {
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

function ConfirmModal({
                          open,
                          title = "Confirm action",
                          description = "Are you sure?",
                          confirmText = "Delete",
                          cancelText = "Cancel",
                          loading = false,
                          onClose,
                          onConfirm,
                      }: ConfirmModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* overlay */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={() => !loading && onClose()}
            />

            {/* modal */}
            <div className="relative w-[92%] max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {description}
                </p>

                <div className="mt-5 flex items-center justify-end gap-3">
                    <button
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-white/[0.03]"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>

                    <button
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Deleting..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

