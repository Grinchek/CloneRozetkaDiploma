import CategoryTree from "../../features/categories/components/CategoryTree.tsx";
import Navbar from '../../components/Navbar';


const HomePage = () => {
    return (
        <>
            <Navbar />
            <div className="layout">


                <aside className="layout-sidebar">
                    <CategoryTree />
                </aside>

                <main className="layout-content">


                    <p>Основний контент сторінки.</p>
                </main>
            </div>
        </>
    )
}

export default HomePage;