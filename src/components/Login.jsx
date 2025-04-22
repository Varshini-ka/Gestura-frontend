import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios"; // Using axios for HTTP requests
import "../styles/login.css"; // Updated styles for Login component

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      navigate("/dashboard"); // Redirect if already logged in
    }
  }, [navigate]);

  const handleLogin = async () => {
    // Form validation
    if (!username || !password) {
      setError("Please enter valid credentials");
      return;
    }

    try {
      const response = await axios.post("https://gestura-backend.onrender.com/api/login", {
        email: username,
        password,
      });

      if (response.data.token) {
        // Store JWT token and user data in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("currentUser", JSON.stringify(response.data.user));

        navigate("/dashboard"); // Navigate to dashboard after login
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid username or password");
    }
  };

  return (
    <div className="container">
      <h2>Login to Gestura</h2>
      {error && <p className="error">{error}</p>}
      <input
        type="text"
        placeholder="Username or Email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
