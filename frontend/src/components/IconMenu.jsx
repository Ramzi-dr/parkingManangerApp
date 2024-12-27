import { useState, useEffect } from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import PropTypes from "prop-types";
import checkLoginStatus from "../login/LoginInfo";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import { useNavigate } from "react-router-dom";
IconMenu.propTypes = {
  logout: PropTypes.func,
};
export default function IconMenu({ logout }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userPosition, setUserPosition] = useState("");
  //const [, setUserEmail] = useState("");
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const navigateToEditAccount = () => {
    navigate("/Account");
    handleClose();
  };
  const navigateToSubUsers = () => {
    navigate("/Users");
    handleClose();
  };
  const exitApp = async () => {
    await logout();
    navigate("/Login");
    handleClose();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const navigateToLogfileTable = ()=>{
    navigate("/Logfile");
    handleClose();
  }

  useEffect(() => {
    const fetchUserPosition = async () => {
      try {
        const response = await checkLoginStatus();
        //setUserEmail(response.email);
        setUserPosition(response.position);
      } catch (error) {
        console.error("failed to fetch user position at iconMenu file", error);
      }
    };
    fetchUserPosition();
  }, []);

  return (
    <div>
      <IconButton
        aria-controls="simple-menu"
        aria-haspopup="true"
        color="primary"
        size="large"
        sx={{
          width: 66, // Larger width
          height: 66, // Larger height
          border: "2px solid #62B6CB", // Circular border
          borderRadius: "50%", // Circular shape
          padding: 0,
          color: "#7c93c3",
          // Remove default padding
        }}
        onClick={handleClick}
      >
        <ManageAccountsIcon sx={{ fontSize: 30 }} />
      </IconButton>
      <Menu
        id="simple-menu"
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "#7c93c3", // Set your desired background color here
            },
          },
        }}
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={navigateToEditAccount}>Edit Password</MenuItem>
        {userPosition === "user" ? (
          <MenuItem onClick={navigateToSubUsers}>Edit Users</MenuItem>
        ) : (
          ""
        )}
        <MenuItem
          onClick={() => {
            navigateToLogfileTable();
            
            
          }}
        >
          Log File
        </MenuItem>
        <MenuItem onClick={exitApp}>Logout</MenuItem>
      </Menu>
    </div>
  );
}
