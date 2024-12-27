import { useState } from "react";
import MyButton from "../components/MyButton";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home"; // Material-UI icon
import { changePassword, logout } from "../dataManager";
import SweetAlert from "../components/SweetAlert";
//import { useAuth } from "../login/AuthContext";
export default function EditUserPassword() {
  //const { userInfo } = useAuth(); // Access login state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [isChar, setChar] = useState({ color: "red" });
  const [isUpper, setIsUpper] = useState({ color: "red" });
  const [includeNumber, setIncludeNumber] = useState({ color: "red" });
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    const success = await changePassword(oldPassword, newPassword);
    if (success) {
      // Inform the user after confirming the password update was successful
      setOldPassword("");
      setNewPassword("");
      setConfirmedPassword("");

      SweetAlert(
        "info",
        "Your password has been updated successfully. You will be logged out to use your new password."
      );
      // Wait 2 seconds before logging out
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Perform logout after the alert
      await logout();
    } else {
      // Handle the failure case
      setOldPassword("");
      setNewPassword("");
      setConfirmedPassword("");
    }
  };

  function checkPasswordFields() {
    if (
      newPassword.length > 4 &&
      oldPassword.length > 5 &&
      confirmedPassword.length > 5
    ) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }

  const handleNewPassword = (password) => {
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
    setNewPassword(password);
  };

  const controlInputs = (e) => {
    e.preventDefault(); // Prevent the default form submission
    if (isValidPassword && newPassword === confirmedPassword) {
      handleRegister();
    } else {
      // If passwords don't match, reset the password fields and alert the user
      setNewPassword("");
      setConfirmedPassword("");
      SweetAlert("alert", "Passwords are not the same!");
    }
  };

  return (
    <div>
      <div className="form-container">
        <form onSubmit={controlInputs}>
          <h2 className="h-container ">Change Password</h2>
          <div className="form-field">
            <label htmlFor="oldPassword">old Password:</label>
            <input
              className="form-input"
              type="password"
              id="oldPassword"
              value={oldPassword}
              onChange={(e) => {
                setOldPassword(e.target.value);
                checkPasswordFields();
              }}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="newPassword">new Password:</label>
            <span className="password-requirements">
              must be <span style={isChar}>6+ chars</span>, with{" "}
              <span style={includeNumber}>1 number</span> and{" "}
              <span style={isUpper}>1 uppercase letter</span>
            </span>
            <input
              className="form-input"
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => {
                handleNewPassword(e.target.value);
                checkPasswordFields();
              }}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="confirmedPassword"> Confirm new Password :</label>
            <input
              className="form-input"
              type="password"
              id="confirmedPassword"
              value={confirmedPassword}
              onChange={(e) => {
                setConfirmedPassword(e.target.value);
                checkPasswordFields();
              }}
              //onMouseLeave={() => { setIsFormValid(true) }}
              required
            />
          </div>
          <div className="login-container">
            <button type="submit" disabled={!isFormValid}>
              confirm{" "}
            </button>
          </div>
        </form>
      </div>
      <div className="home-button">
        <MyButton
          text="cancel"
          onClick={() => {
            navigate("/");
          }}
          startIcon={<HomeIcon />}
        ></MyButton>
      </div>
    </div>
  );
}
