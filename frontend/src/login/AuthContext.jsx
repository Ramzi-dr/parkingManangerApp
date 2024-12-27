import  {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import {API_URL} from  "../serverCredentials"

// Create Auth context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    email: "",
    firstName: "",
    lastName: "",
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Use useCallback to memoize the checkLoginStatus function
  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}check_login`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        // Only redirect to login if not already on login or register page
        if (
          location.pathname !== "/Login" &&
          location.pathname !== "/Register"
        ) {
          setIsLoggedIn(false);
          navigate("/Login");
        }
      } else if (response.ok) {
        const data = await response.json();
        if (data && data.email && data.first_name && data.last_name) {
          // Update userInfo with the data from the response
          setUserInfo({
            email: data.email,
            firstName: data.first_name,
            lastName: data.last_name,
          });
        }
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error("Error checking login status:", err);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  const login = () => setIsLoggedIn(true);

  const logout = async () => {
    try {
      await fetch(`${API_URL}logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      setIsLoggedIn(false);
      navigate("/Login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, isLoading, login, logout, userInfo }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// PropTypes validation
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to use AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
