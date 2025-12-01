import '../styles/footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} CloneRozetka. Усі права захищені.</p>
            </div>
        </footer>
    );
};

export default Footer;
