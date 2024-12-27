import {API_URL, basicAuth} from './serverCredentials'
//import { resolveConfig } from "prettier";
import SweetAlert from "./components/SweetAlert";

//////////////////////////////////////////////////////////////////////////////////////////
/////////////////////// get timeProfiles /////////////////////////////////////////////////

const getTimeProfiles = async () => {
  try {
    const response = await fetch(`${API_URL}get_time_profiles`, {
      method: "GET",
      headers: {
        Authorization: basicAuth,
        "content-Type": "application(json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message); //  this will pass the error message to the catch block
    }
    const data = await response.json();
    return data.timeProfiles;
  } catch (error) {
    console.error("Fetch error in GET request", error.message);
    SweetAlert("alert", error.message);
  }
};
/////////////////////////////////////////////////////////////////////////////////////
//////////////////// create a new Time Profile //////////////////////////////////////
// Function to create a new Time Profile
const createTimeProfile = async (timeProfileData) => {
  console.log(timeProfileData);

  try {
    const response = await fetch(`${API_URL}create_time_profile`, {
      method: "POST",
      headers: {
        Authorization: basicAuth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: timeProfileData.title,
        startDate: timeProfileData.startDate, // Directly pass the date in DD.MM.YYYY format
        startTime: timeProfileData.startTime,
        endDate: timeProfileData.endDate, // Directly pass the date in DD.MM.YYYY format
        endTime: timeProfileData.endTime,
        cars: timeProfileData.cars,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const message = await response.json();
    return message;
  } catch (error) {
    console.error("Fetch error in POST request: ", error.message);
    SweetAlert("Alert", error.message);
  }
};

// Function to update a Time Profile
const updateTimeProfile = async (id, newData) => {
  console.log(newData)
  try {
    const response = await fetch(`${API_URL}update_time_profile/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: basicAuth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error in PATCH request:", error.message);
    SweetAlert("alert", error.message);
  }
};



//////////////////////////////////////////////////////////////////////////
////////////////////////////// add cars to time profile ///////////////////////
const addCarsToTimeProfile = async (timeProfileId, selectedCars) => {
  try {
    const response = await fetch(
      `${API_URL}add_cars_to_time_profile/${timeProfileId}`,
      {
        method: "POST",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cars: selectedCars,
        }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
    const message = await response.json();
    return message;
  } catch (error) {
    console.error("Fetch error in POST request: ", error.message);
    SweetAlert("Alert", error.message);
  }
};
/////////////////////////////////////////////////////////////////////////
////////////////////////// update cars list in time profile /////////////
const updateCarsListInTimeProfile = async (timeProfileId, selectedCars) => {
  try {
    const response = await fetch(
      `${API_URL}update_cars_in_time_profile/${timeProfileId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cars: selectedCars, // Pass in the selected car list
        }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error in PATCH request:", error.message);
    SweetAlert("alert", error.message);
  }
};

//////////////////////////////////////////////////////////////////////////
////////////////////////////// delete time profile ///////////////////////
const deleteTimeProfile = async (id) => {
  try {
    const response = await fetch(`${API_URL}delete_time_profile/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: basicAuth,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
  } catch (error) {
    console.error("Error deleting time profile: ", error.message);
    SweetAlert("alert", error.message);
  }
};

export {
  createTimeProfile,
  updateTimeProfile,
  getTimeProfiles,
  updateCarsListInTimeProfile,
  deleteTimeProfile,
  addCarsToTimeProfile,
};
