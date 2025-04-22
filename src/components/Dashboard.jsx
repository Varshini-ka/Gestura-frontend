import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css"; // New styles for Dashboard component

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1>Welcome to Gestura</h1>
      <p>Choose an option:</p>
      <button onClick={() => navigate("/text-to-sign")}>Text to Sign</button>
      <button onClick={() => navigate("/speech-to-sign")}>Speech to Sign</button>
    </div>
  );
}

export default Dashboard;
