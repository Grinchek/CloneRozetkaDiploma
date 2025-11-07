import CategoryTree from "../../features/categories/components/CategoryTree.tsx";
import {Link} from "react-router-dom";

const HomePage = () => {
    return (
        <>
            <div className="layout">
                <aside className="layout-sidebar">
                    <CategoryTree />
                </aside>

                <main className="layout-content">
                    <h1>Мій дипломний проєкт</h1>
                    <p>Основний контент сторінки.</p>
                    <Link to={"/login"}>Вхід</Link>
                </main>
            </div>
        </>
    )
}

export default HomePage;