import { useNavigate } from "react-router-dom";
import "../styles/home.css"; // Updated styles for Home component

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="home-title">Welcome to <span className="highlight">Gestura </span>👋🏻</h1>
        <p className="home-subtitle">Bridging communication through sign language</p>
      </div>
      <div className="home-buttons">
        <button className="btn-primary" onClick={() => navigate("/login")}>Login</button>
        <button className="btn-secondary" onClick={() => navigate("/signup")}>Sign Up</button>
      </div>
    </div>
  );
}

export default Home;
