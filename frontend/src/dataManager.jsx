
import {API_URL, basicAuth} from  "./serverCredentials"
import SweetAlert from "./components/SweetAlert";

///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// Create new car data
const createData = async (carData) => {
  const { startTime, endTime } = carData.accessTime;
  console.log(carData);
  try {
    const response = await fetch(`${API_URL}create_carData`, {
      method: "POST",
      headers: {
        Authorization: basicAuth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isWhitelisted: true,
        carLicencePlate: carData.carLicencePlate,
        firstName: carData.firstName,
        lastName: carData.lastName,
        startTime: startTime,
        endTime: endTime,
        days: carData.days,
      }),
    });

    // Check for non-OK responses
    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(`Network response was not ok: ${errorData.message}`);
    }

    const data = await response.json();
    //SweetAlert('info', data.message)
    return data; // Return the data for further use
  } catch (error) {
    console.error("Fetch error in POST request:", error.message);
    SweetAlert("alert", error.message);
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// Update car data///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
const updateData = async (carId, updatedData) => {
  try {
    const response = await fetch(`${API_URL}update_carData/${carId}`, {
      method: "PATCH",
      headers: {
        Authorization: basicAuth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Network response was not ok: ${errorData.message}`);
    }
    const data = await response.json();
    // SweetAlert('info', data.message)
    return data;
  } catch (error) {
    console.error("Fetch error in PATCH request:", error.message);
    SweetAlert("alert", error.message);
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// Delete car data////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
const deleteData = async (carId) => {
  try {
    const response = await fetch(`${API_URL}delete_carData/${carId}`, {
      method: "DELETE",
      headers: {
        Authorization: basicAuth,
      },
    });

    // Check for non-OK responses
    if (!response.ok) {
      throw new Error("User with id: " + carId + " cannot be deleted.");
    }
    //SweetAlert('info', `DELETE request for user id ${carId} successful.`)
    return true; // Return a success flag or true
  } catch (error) {
    console.error("Error deleting car data:", error.message);
    SweetAlert("alert", error.message);
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// Change password
const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await fetch(`${API_URL}update_password`, {
      method: "PATCH",
      headers: {
        Authorization: basicAuth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oldPassword: oldPassword,
        newPassword: newPassword,
      }),
    });

    // Check for non-OK responses
    if (!response.ok) {
      const errorData = await response.json();
      SweetAlert("alert", errorData.message);
      return false; // Return false if the response was not OK
    }

    // Return true before informing the user
    return true; // Return true indicating success
  } catch (error) {
    console.error("Fetch error in POST request:", error.message);
    SweetAlert("alert", error.message);
    return false; // Return false if there was an error
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////logout
const logout = async () => {
  try {
    await fetch(`${API_URL}logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: basicAuth,
        "Content-Type": "application/json",
      },
    });
    // Redirect to login after successful logout
    window.location.href = "/Login";
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

export { createData, updateData, deleteData, changePassword, logout };
