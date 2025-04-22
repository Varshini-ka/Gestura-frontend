import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard"; // New page with 2 buttons
import TextToSign from "./components/TextToSign";
import SpeechToSign from "./components/SpeechToSign";
import "./styles/app.css"; // Updated styles
import "./styles/login.css";
import "./styles/signup.css";
import "./styles/home.css";
import "./styles/dashboard.css"; // New styles for Dashboard
import "./styles/texttosign.css"; // New styles for TextToSign
import "./styles/speechtosign.css"; // New styles for SpeechToSign




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* Updated navigation */}
        <Route path="/text-to-sign" element={<TextToSign />} />
        <Route path="/speech-to-sign" element={<SpeechToSign />} />
      </Routes>
    </Router>
  );
}

export default App;
