import AdminCategoriesSection from "../components/AdminCategoriesSection";
import '../styles/admin.css';

const AdminPage = () => {
    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>Адмін панель</h1>

            </div>

            <div className="admin-grid">
                <section className="admin-card">
                    <AdminCategoriesSection />
                </section>
            </div>
        </div>
    );
};

export default AdminPage;
