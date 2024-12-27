
import {API_URL}from '../serverCredentials'
const checkLoginStatus = async () => {
  try {
    const response = await fetch(`${API_URL}check_login`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      if (data) {
        const position = data.user_position;
        const email = data.email;

        return { position, email };
      }
    } else {
      throw new Error("User is not logged in or an error occurred");
    }
  } catch (error) {
    console.error("Error:", error);
    return null; // Return null or handle the error as needed
  }
};


export default checkLoginStatus;

