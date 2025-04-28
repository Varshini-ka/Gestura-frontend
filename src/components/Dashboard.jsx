import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div className="container">
      <h1>Welcome to Gestura</h1>
      <p>Choose an option:</p>
      <div className="button-group">
        <button onClick={() => navigate("/text-to-sign")}>Text to Sign</button>
        <button onClick={() => navigate("/speech-to-sign")}>Speech to Sign</button>
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
