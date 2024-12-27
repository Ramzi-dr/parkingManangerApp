/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import HomeIcon from "@mui/icons-material/Home";
import MyButton from "../components/MyButton";
import {
  getSubUsers,
  updateSubUser,
  deleteSubUser,
} from "../subUsersDataManager";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../login/AuthContext";
import DataTable from "../components/DataTable"; // Use the shared DataTable component
import { RiUserAddLine } from "react-icons/ri";

export default function Users() {
  const { userInfo } = useAuth(); // Access login state
  const [subUsersData, setSubUsersData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();
  async function getSubUsersList() {
    try {
      const subUsers = await getSubUsers();
      setSubUsersData(subUsers);
      setFilteredData(subUsers);
    } catch (error) {
      console.error("Error fetching sub-users:", error);
    }
  }
  // Fetch sub-users data
  useEffect(() => {
    if (userInfo.email && userInfo.email.length > 3) {
      getSubUsersList();
    }
  }, [userInfo.email]);

  // Apply filters to sub-users data
  useEffect(() => {
    const applyFilters = () => {
      setFilteredData(
        subUsersData.filter((subUser) =>
          Object.keys(filters).every((key) =>
            (subUser[key] || "")
              .toLowerCase()
              .includes((filters[key] || "").toLowerCase())
          )
        )
      );
    };

    applyFilters();
  }, [subUsersData, filters]);

  const handleSubUserDelete = async (id, subUserEmail) => {
    try {
      await deleteSubUser( subUserEmail);
      getSubUsersList();
    } catch (error) {
      console.error("Error deleting SubUser: ", error);
    }
  };

  const handleSubUserUpdate = async ( id,newSubUserData) => {
   

    try {
      await updateSubUser( newSubUserData);
      getSubUsersList();
    } catch (error) {
      console.error("Error updating SubUser data:", error);
    }
  };

  return (
    <div>


      <DataTable
        filteredData={filteredData}
        handleDelete={handleSubUserDelete}
        handleUpdate={handleSubUserUpdate}
        type="subUser" // Specify that this is for sub-users
      /> <div className="add-subUser-button">
        <MyButton
          text="Add user"
          onClick={() => navigate("/AddUser",{ state: { parentEmail: userInfo.email } })}
          startIcon={<RiUserAddLine />}
        />
      </div>
      <div className="home-button">
        <MyButton
          text="Home"
          onClick={() => navigate("/")}
          startIcon={<HomeIcon />}
        />
      </div>
    </div>
  );
}
