
import {API_URL, basicAuth} from './serverCredentials'
import SweetAlert from "./components/SweetAlert";
///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// Get subUsers
const getSubUsers = async () => {
  try {
    const response = await fetch(`${API_URL}get_sub_users`, {
      method: "GET",
      headers: {
        Authorization: basicAuth,
        "Content-Type": "application/json",
      },
    });

    // Check for non-OK responses
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message); // Pass the error message to the catch block
    }

    const data = await response.json();
    const subUsers = data.sub_users_data;
    return subUsers; // Return the data for further use
  } catch (error) {
    console.error("Fetch error in GET request:", error.message);
    SweetAlert("alert", error.message);
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// Create new subUser
const createSubUser = async (subUserData) => {
  try {
    const response = await fetch(`${API_URL}create_sub_user`, {
      method: "POST",
      headers: {
        Authorization: basicAuth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: subUserData.status,
        email: subUserData.email,
        first_name: subUserData.firstName,
        last_name: subUserData.lastName,
      }),
    });

    // Check for non-OK responses
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
    const data = await response.json();
    //SweetAlert("info", "User created successfully!");
    return data; // Return the data for further use
  } catch (error) {
    console.error("Fetch error in POST request:", error.message);
    SweetAlert("alert", error.message);
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// Update Sub user data
const updateSubUser = async (updatedData) => {
  try {
    const response = await fetch(`${API_URL}update_sub_user`, {
      method: "PATCH",
      headers: {
        Authorization: basicAuth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message); // Pass the error message to the catch block
    }
    const data = await response.json();
    //SweetAlert("info", data.message);
    return data;
  } catch (error) {
    console.error("Fetch error in PATCH request:", error.message);
    SweetAlert("alert", error.message);
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// Delete sub user
const deleteSubUser = async (subUserEmail) => {
  
  const confirmedDelete = {}
  confirmedDelete['email'] =subUserEmail
  confirmedDelete['forceDelete'] =true
  try {
    const response = await fetch(`${API_URL}delete_sub_user`, {
      method: "DELETE",
      headers: {
        Authorization: basicAuth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(confirmedDelete),
    });

    // Check for non-OK responses
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message); // Pass the error message to the catch block
    }

    return true; // Return a success flag or true
  } catch (error) {
    console.error("Error deleting car data:", error.message);
    SweetAlert("alert", error.message);
  }
};

export { createSubUser, getSubUsers, updateSubUser, deleteSubUser };
