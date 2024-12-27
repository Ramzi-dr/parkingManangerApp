import { useState } from "react";
import Login from "../login/Login";
import { useAuth } from "../login/AuthContext";
import MyButton from "../components/MyButton";
import { useNavigate } from "react-router-dom";
import { createSubUser } from "../subUsersDataManager";
import AddTaskIcon from "@mui/icons-material/AddTask";
import HomeIcon from "@mui/icons-material/Home"; // Material-UI icon
import SweetAlert from "../components/SweetAlert";


export default function AddUser() {
    const { isLoggedIn, isLoading } = useAuth();
    const navigate = useNavigate();
    const [statusHint, setStatusHint] = useState("");
    const [isValidEmail, setIsValidEmail] = useState(true);
    const [subUserData, setSubUserData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        status: "Active",
    });


    // Function to validate email format
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
        return emailRegex.test(email);
    };
    const handleEmailChange = (e) => {
        const inputEmail = e.target.value;
        setSubUserData((prevData) => ({
            ...prevData,
            email: inputEmail,
        }));
        setIsValidEmail(validateEmail(inputEmail));
        e.preventDefault();
    };

    function updateFirstName(event) {
        const firstName = event.target.value;
        setSubUserData((prevData) => ({
            ...prevData,
            firstName: firstName,
        }));
        event.preventDefault();
    }
    function updateLastName(event) {
        const lastName = event.target.value;
        setSubUserData((prevData) => ({
            ...prevData,
            lastName: lastName,
        }));
        event.preventDefault();
    }
    function updateStatus(event) {
        const status = event.target.value.charAt(0).toUpperCase() + event.target.value.slice(1);

        const validStatuses = ["Active", "Inactive"];
        if (!validStatuses.includes(status)) {
            setStatusHint('"Must be Active or Inactive"')
        }
        if (validStatuses.includes(status)) {
            setStatusHint('')
        }
        setSubUserData((prevData) => ({
            ...prevData,
            status: status,
        }));
        event.preventDefault();


    }

    const controleInputs = () => {
        if (!isValidEmail) {
            SweetAlert('alert', 'invalid Email')
            setSubUserData((prevData) => ({
                ...prevData,
                email: "",
            }));

        } else if (
            subUserData.email === "" ||
            subUserData.firstName === "" ||
            subUserData.lastName === "" ||
            subUserData.status === ""

        ) {
            SweetAlert('alert', "Please fill all fields")
            return;
        } else if (!["Active", "Inactive", "Pending"].includes(subUserData.status)) {
            SweetAlert("alert", "invalid status! must be 'Active or Inactive'.");
            return;
        } else {
            addSubUser();
        }

    }

    const addSubUser = async () => {

        try {
            await createSubUser(subUserData);
            navigate("/Users");
        } catch (error) {
            console.error("Error adding user:", error);
        }
    }


    // Render nothing or a loading spinner until the authentication check is complete
    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!isLoggedIn) {
        return <Login />; // Render login page if not logged in
    }
    return (
        <div>
            <div className="form-container">
                <form >
                    <div className="form-field">
                        <label>User Email:</label>
                        <input
                            className="form-input"
                            type="text"
                            name={subUserData.email}
                            value={subUserData.email}
                            onChange={handleEmailChange}
                        />
                    </div>
                    <div className="form-field">
                        <label> User First Name:</label>
                        <input
                            className="form-input"
                            type="text"
                            name={subUserData.firstName}
                            value={subUserData.firstName}
                            onChange={updateFirstName}
                        />
                    </div>
                    <div className="form-field">
                        <label> User Last Name:</label>
                        <input
                            className="form-input"
                            type="text"
                            name={subUserData.lastName}
                            value={subUserData.lastName}
                            onChange={updateLastName}
                        />
                    </div><div className="form-field">
                        <label> User Status: <span style={{ color: 'gray' }}>{statusHint}</span></label>
                        <input
                            className="form-input"
                            type="text"
                            name={subUserData.status}
                            value={subUserData.status}
                            onChange={updateStatus}
                        />
                    </div>
                    <div className="form-field">
                        <MyButton
                            text="add User"
                            onClick={(e) => controleInputs(e)}
                            startIcon={<AddTaskIcon />}
                        ></MyButton>
                    </div>
                </form>
            </div>
            <div className="home-button">
                <MyButton
                    text="home"
                    onClick={() => {
                        navigate("/");
                    }}
                    startIcon={<HomeIcon />}
                ></MyButton>
            </div>
        </div>
    );
}


