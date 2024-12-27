import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SweetAlert from "../components/SweetAlert";
import {API_URL} from  "../serverCredentials"
const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [, setMessage] = useState("");
  const navigate = useNavigate();
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [isChar, setChar] = useState({ color: "red" });
  const [isUpper, setIsUpper] = useState({ color: "red" });
  const [includeNumber, setIncludeNumber] = useState({ color: "red" });

  // Function to validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
    return emailRegex.test(email);
  };

  const handlePassword = (password) => {
    let isValid = true;

    // Check if password length is greater than 5
    if (password.length > 5) {
      setChar({ color: "green" });
    } else {
      setChar({ color: "red" });
      isValid = false;
    }

    // Check if the password contains an uppercase letter
    if (/[A-Z]/.test(password)) {
      setIsUpper({ color: "green" });
    } else {
      setIsUpper({ color: "red" });
      isValid = false;
    }

    // Check if the password contains a number
    if (/[0-9]/.test(password)) {
      setIncludeNumber({ color: "green" });
    } else {
      setIncludeNumber({ color: "red" });
      isValid = false;
    }

    // Set isValidPassword to true only if all conditions are met
    setIsValidPassword(isValid);

    // Save the password
    setPassword(password);
  };

  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    setIsValidEmail(validateEmail(inputEmail));
  };

  const controlInputs = (e) => {
    e.preventDefault(); // Prevent the default form submission
    if (isValidPassword && password === confirmedPassword) {
      handleRegister();
    } else {
      // If passwords don't match, reset the password fields and alert the user
      setPassword("");
      setConfirmedPassword("");
      SweetAlert("alert", "Passwords are not the same!");
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(`${API_URL}register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (response.ok) {
        setMessage("Registration successful! You can now log in.");
        setEmail("");
        setPassword("");
        setConfirmedPassword("");
        SweetAlert(
          "info",
          "Registration successful! You can now log in.",
          () => {
            navigate("/"); // Redirect to login page
          }
        );
        // Wait 2 seconds before logging out
        await new Promise((resolve) => setTimeout(resolve, 2000));
        // Perform logout after the alert
        navigate("/"); // Redirect to login page
      } else {
        const data = await response.json();
        setMessage(data.message);
        setPassword("");
        setConfirmedPassword("");
        SweetAlert("alert", data.messager);
      }
    } catch (error) {
      console.error("Error registering user:", error);
      setMessage("Error registering user.");
      setPassword("");
      setConfirmedPassword("");
      SweetAlert("alert", "Error registering user.");
    }
  };
  const handleLogin = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmedPassword("");
    navigate("/Login");
  };

  return (
    <div className="form-container">
      <form onSubmit={controlInputs}>
        <h2 className="h-container ">Register</h2>
        <div className="form-field">
          <label htmlFor="first name">First Name:</label>
          <input
            className="form-input"
            type="text"
            id="firsName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="last name">Last Name:</label>
          <input
            className="form-input"
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="email">Email:</label>
          <input
            className={`form-input ${isValidEmail ? "" : "invalid-input"}`}
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password:</label>
          <span className="password-requirements">
            must be <span style={isChar}>6+ chars</span>, with{" "}
            <span style={includeNumber}>1 number</span> and{" "}
            <span style={isUpper}>1 uppercase letter</span>
          </span>
          <input
            className="form-input"
            type="password"
            id="password"
            value={password}
            onChange={(e) => handlePassword(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="confirmedPassword"> Confirm Password :</label>
          <input
            className="form-input"
            type="password"
            id="confirmedPassword"
            value={confirmedPassword}
            onChange={(e) => setConfirmedPassword(e.target.value)}
            required
          />
        </div>
        <div className="login-container">
          <button type="submit">Register</button>
        </div>

        <p style={{ fontSize: "1.2rem", paddingLeft: "0.9rem" }}>
          Already have an account?
          <span
            style={{
              fontFamily: "bold",
              color: "white",
              textDecoration: "underline",
              cursor: "pointer",
              paddingLeft: "0.8rem",
            }}
            onClick={handleLogin}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;
