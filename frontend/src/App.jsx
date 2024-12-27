/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import "./index.css";
import io from "socket.io-client";
import MyButton from "./components/MyButton";
import DataTable from "./components/DataTable";
import {fetchCarsData} from "./fetchData";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import DriveEtaIcon from "@mui/icons-material/DirectionsCar"; 
import ListIcon from "@mui/icons-material/List";
import DescriptionIcon from "@mui/icons-material/Description";
import { useNavigate } from "react-router-dom";
import { deleteData, updateData } from "./dataManager";
import IconMenu from "./components/IconMenu";
import { useAuth } from "./login/AuthContext";
import {WEBSOCKET_URL} from "./serverCredentials"
import KeyIcon from '@mui/icons-material/Key'; // Import Key icon

import LockIcon from '@mui/icons-material/Lock'; // Import Lock icon

import LockOpenIcon from '@mui/icons-material/LockOpen'; // Import Lock Open icon

const App = () => {
  const { isLoggedIn, isLoading, logout } = useAuth();
  const [socket, setSocket] = useState(null);
  const [carsData, setCarsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [relayIsOn, setRelayIsOn] = useState(false);
  const [isArmed, setIsArmed] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    if (isLoading) return; 
    if (!isLoggedIn) {
      navigate("/Login"); 
      return;
    }

    fetchCarsData({ setCarsData, setLoading });

    const newSocket = io(WEBSOCKET_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket");
    });

    newSocket.on("anpr_data_received", (data) => {
      console.log("ANPR data received:", data);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
    });

    newSocket.on("relay_is_on", () => {
      console.log("is on");
      setRelayIsOn(true);
      setTimeout(() => {
        setRelayIsOn(false);
      }, 2000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    const applyFilters = () => {
      setFilteredData(
        carsData.filter((car) =>
          Object.keys(filters).every((key) => car[key].includes(filters[key]))
        )
      );
    };

    applyFilters();
  }, [carsData, filters]);

  const openGate = async () => {
    try {
      if (socket) {
        socket.emit("click_event", {});
      }
    } catch (error) {
      console.error("openGate error:", error);
    }
  };

  const toggleAlarm = async () => {
    try {
      if (socket) {
        if (isArmed) {
          socket.emit("disarm", {}); 
        } else {
          socket.emit("arm", {}); 
        }
      }
    } catch (error) {
      console.error("toggle alarm error: ", error);
    }
  };

  useEffect(() => {
    if (!socket) return; // Ensure socket is initialized

    const handleArmResponse = (data) => {
      console.log(data); 
      setIsArmed(true); 
    };

    const handleDisarmResponse = (data) => {
      console.log(data); 
      setIsArmed(false); 
    };

    socket.on("arm", handleArmResponse);
    socket.on("disarm", handleDisarmResponse);

    return () => {
      socket.off("arm", handleArmResponse);
      socket.off("disarm", handleDisarmResponse);
    };
  }, [socket]);

  const handleCarDelete = async (carId) => {
    try {
      await deleteData(carId);
      fetchCarsData({ setCarsData, setLoading });
    } catch (error) {
      console.error("Error updating car data:", error);
    }
  };

  const handleCarUpdate = async (carId, newCarData) => {
    try {
      await updateData(carId, newCarData);

      const updatedCarsData = carsData.map((car) =>
        car.id === carId ? { ...car, ...newCarData } : car
      );

      setCarsData(updatedCarsData);
      setFilteredData(
        updatedCarsData.filter((car) =>
          Object.keys(filters).every((key) => car[key].includes(filters[key]))
        )
      );
    } catch (error) {
      console.error("Error updating car data:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn) {
    return null; 
  }

  return (
    <div>
      <br />
      <div className="header-container">
        <h1 className="app-title">ParkingManager</h1>
        <div className="icon-menu-container">
          <IconMenu logout={logout} />
        </div>
      </div>

      <div className="top-container">
        <div className="button-container">
          <MyButton
            text="Add car"
            onClick={() => navigate("/AddCar")}
            startIcon={<DriveEtaIcon />}
          />
        </div>
        <div className="button-container">
          <MyButton
            text="open gate"
            onClick={openGate}
            startIcon={<MeetingRoomIcon />}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          filteredData={filteredData}
          handleDelete={handleCarDelete}
          handleUpdate={handleCarUpdate}
          type="car"
        />
      )}

      <div className="bottom-container">
        {/* <div className="button-container">
          {<MyButton
            disabled={false}
            text={isArmed ? "disarm" : "arm"}
            onClick={toggleAlarm}
            startIcon={isArmed? <LockIcon/>: <LockOpenIcon/>}
          />}
        </div>
        <div className="button-container">
          <MyButton
            disabled={false}
            text="Time profile"
            onClick={() => {
              navigate("/TimeProfile");
            }}
            startIcon={<DescriptionIcon />}
          />
        </div> */}
      </div>
    </div>
  );
};

export default App;
