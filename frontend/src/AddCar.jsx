/* eslint-disable no-unused-vars */
import { useState } from "react";
import Login from "./login/Login";
import { useAuth } from "./login/AuthContext";
import MyButton from "./components/MyButton";
import { useNavigate } from "react-router-dom";
import { createData } from "./dataManager";
import AddTaskIcon from "@mui/icons-material/AddTask";
import HomeIcon from "@mui/icons-material/Home"; // Material-UI icon
import SweetAlert from "./components/SweetAlert";
import DaysCheckBox from "./components/DaysCheckBox";
import TimeSelector from "./components/TimeSelector";
//import TimeProfileSelector from "./components/TimeProfileSelector";
export default function AddCar() {
  const { isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const [carData, setCarData] = useState({
    carLicencePlate: "",
    firstName: "",
    lastName: "",
    days: [],
    accessTime: {},
  });
  function accessDays(checkedDays) {
    setCarData((prevData) => ({
      ...prevData,
      days: checkedDays,
    }));
  }
  function accessTimeUpdater(accessTime) {
    console.log("timeUpdater called");
    console.log(accessTime);
    setCarData((prevData) => ({
      ...prevData,
      accessTime: accessTime,
    }));
  }

  function updateCarLicencePlate(event) {
    // Get the value and remove any non-alphanumeric characters
    const carLicencePlate = event.target.value.replace(/[^a-zA-Z0-9]/g, "");
    setCarData((prevData) => ({
      ...prevData,
      carLicencePlate: carLicencePlate,
    }));
    event.preventDefault();
  }
  function updateFirstName(event) {
    const firstName = event.target.value;
    setCarData((prevData) => ({
      ...prevData,
      firstName: firstName,
    }));
    event.preventDefault();
  }
  function updateLastName(event) {
    const lastName = event.target.value;
    setCarData((prevData) => ({
      ...prevData,
      lastName: lastName,
    }));
    event.preventDefault();
  }

  const addCar = async (e) => {
    e.preventDefault();
    if (
      carData.carLicencePlate === "" ||
      carData.firstName === "" ||
      carData.lastName === ""
    ) {
      SweetAlert("alert", "Please fill all fields");
      return;
    } else if (carData.carLicencePlate.length < 2) {
      SweetAlert(
        "alert",
        "invalid carLicencePlate!  must be at least 2 characters."
      );
      return;
    } else {
      try {
        await createData(carData);
        //await fetchCarsData();
        navigate("/");
        //setCarsData((prevCarsData) => prevCarsData.filter((car) => car.id !== 3)); // Update state to remove deleted car
      } catch (error) {
        console.error("Error adding car:", error);
      }
    }
  };

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
        <form>
          <div className="form-field">
            <label>Car Licence Plate:</label>
            <input
              className="form-input"
              type="text"
              name={carData.carLicencePlate}
              value={carData.carLicencePlate}
              onChange={updateCarLicencePlate}
            />
          </div>
          <div className="form-field">
            <label>First Name:</label>
            <input
              className="form-input"
              type="text"
              placeholder="Enter owner's first name*"
              name={carData.firstName}
              value={carData.firstName}
              onChange={updateFirstName}
            />
          </div>
          <div className="form-field">
            <label>Last Name:</label>
            <input
              className="form-input"
              type="text"
              placeholder="Enter owner's last name*"
              name={carData.lastName}
              value={carData.lastName}
              onChange={updateLastName}
            />
          </div>
          <div className="centered-container">
            {/* <DaysCheckBox accessDays={accessDays} />
            <div
              style={{
                justifyContent: "space-between",
                display: "flex",
                width: "250px",
                marginTop: "5px",
              }}
            >
              <span>Start time</span>
              <span>End time</span>
            </div>

            <TimeSelector accessTimeUpdater={accessTimeUpdater} /> */}
            {/* <TimeProfileSelector/> */}
          </div>

          <div className="form-field">
            <MyButton
              text="add Car"
              onClick={(e) => addCar(e)}
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
