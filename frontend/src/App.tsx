import CategoryTree from "./features/categories/components/CategoryTree";
import "./styles.css";

export default function App() {
  return (
    <div className="layout">
      <aside className="layout-sidebar">
        <CategoryTree />
      </aside>

      <main className="layout-content">
        <h1>Мій дипломний проєкт</h1>
        <p>Основний контент сторінки.</p>
      </main>
    </div>
  );
}
