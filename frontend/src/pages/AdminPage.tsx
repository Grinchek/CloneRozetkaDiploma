import AdminCategoriesSection from "../components/AdminCategoriesSection";
import '../styles/admin.css';

const AdminPage = () => {
    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>Адмін панель</h1>
                <p>Керування магазином CloneRozetka</p>
            </div>

            <div className="admin-grid">
                <section className="admin-card">
                    <AdminCategoriesSection />
                </section>

               {/* <section className="admin-card">
                    <h2>Товари</h2>
                    <p>Керування списком товарів.</p>
                     Тут пізніше буде список товарів
                </section>

                <section className="admin-card">
                    <h2>Користувачі</h2>
                    <p>Перегляд користувачів, блокування тощо.</p>
                     Тут пізніше – управління юзерами
                </section>*/}
            </div>
        </div>
    );
};

export default AdminPage;
