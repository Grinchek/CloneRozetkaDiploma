import LoginWithGoogleButton from "../../features/auth/LoginWithGoogleButton.tsx";
import CategoryTree from "../../features/categories/components/CategoryTree.tsx";

const HomePage = () => {
    return (
        <>
            <div className="layout">
                <aside className="layout-sidebar">
                    <LoginWithGoogleButton />
                    <CategoryTree />
                </aside>

                <main className="layout-content">
                    <h1>Мій дипломний проєкт</h1>
                    <p>Основний контент сторінки.</p>
                </main>
            </div>
        </>
    )
}

export default HomePage;