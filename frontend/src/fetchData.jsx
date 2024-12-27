import { basicAuth, API_URL } from "./serverCredentials";

///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////// Fetch cars data from the backend
const fetchCarsData = async ({ setCarsData, setLoading }) => {
  try {
    const response = await fetch(`${API_URL}carsData`, {
      headers: {
        Authorization: basicAuth,
      },
    });
    if (!response.ok) {
      const data = await response.json();
      alert(data.message);
      throw new Error("Network response in POST request was not ok");
    }
    const data = await response.json();
    //console.log("fetched data ", data.carsData);
    setCarsData(data.carsData);
  } catch (error) {
    console.error("Fetch error:", error);
  } finally {
    setLoading(false);
  }
};

const fetchLogfile = async () => {
  try {
    const response = await fetch(`${API_URL}get_logfile`, {
      headers: {
        Authorization: basicAuth,
      },
    });
    if (!response.ok) {
      const data = await response.json();
      console.log(data);
      alert(data.message);
      throw new Error("Network response in POST request was not ok");
    }
    const data = await response.json();
    return data.logfile_data;
  } catch (error) {
    console.error("Fetch error:", error);
  } finally {
    console.log("fanily");
  }
};

export { fetchCarsData, fetchLogfile };
