//Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import SweetAlert from "../components/SweetAlert";
import { API_URL } from "../serverCredentials";
const Login = () => {
  const { login } = useAuth(); //access login function
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setMessage] = useState("");
  const navigate = useNavigate();
  const [isValidEmail, setIsValidEmail] = useState(true);
  const userHelpStyle = {
    fontFamily: "bold",
    color: "white", // Set the desired color
    textDecoration: "underline", // Underline text
    cursor: "pointer", // Add pointer cursor for clickability
  };

  // Function to validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
    return emailRegex.test(email);
  };
  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    setIsValidEmail(validateEmail(inputEmail));
  };

  const handleRegister = () => {
    setEmail("");
    setPassword("");
    navigate("/Register");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        login(); // update login state
        setEmail("");
        setPassword("");
        navigate("/"); // Redirect to home or other page
      } else {
        const data = await response.json();
        setMessage(data.message);
        //setEmail("");
        setPassword("");
        if (
          data.message ===
          "You need to register with a valid password to access this account"
        ) {
          SweetAlert("alert", data.message, () => {
            handleRegister();
          });
        } else SweetAlert("alert", data.message);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setMessage("Error logging in.");
      //setEmail("");
      setPassword("");
      SweetAlert("alert", "Error logging in.");
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleLogin}>
        <h2 className="h-container ">Login</h2>
        <div className="form-field">
          <label htmlFor="email">Email:</label>
          <input
            className={`form-input ${isValidEmail ? "" : "invalid-input"}`}
            type="email"
            id="username"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password:</label>
          <input
            className="form-input"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="login-container">
          <button type="submit">Login</button>
        </div>
        <p style={{ fontSize: "1.2rem" }}>
          Don&#39;t have an account?{" "}
          <span style={userHelpStyle} onClick={handleRegister}>
            Register
          </span>
        </p>
        <p
          style={{ textAlign: "center" }}
          onClick={() => {
            SweetAlert("info", " Please contact the Admin");
          }}
        >
          <span style={userHelpStyle}>Forgot password?</span>
        </p>
      </form>
    </div>
  );
};

export default Login;
