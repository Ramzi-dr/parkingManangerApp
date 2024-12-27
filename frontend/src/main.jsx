import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import AddCar from "./AddCar";
import AddUser from "./userAccount/AddUser.jsx";
import Login from "./login/Login.jsx";
import Register from "./login/Register.jsx";
import TimeProfile from "./TimeProfile.jsx";
import LogfileTable from "./components/LogfileTable.jsx";
import EditUserPassword from "./userAccount/EditUserPassword.jsx";
import Users from "./userAccount/Users.jsx";
import { AuthProvider } from "./login/AuthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/AddCar" element={<AddCar />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Account" element={<EditUserPassword />} />
        <Route path="/Users" element={<Users />} />
        <Route path="/AddUser" element={<AddUser />} />
        <Route path="/TimeProfile" element={<TimeProfile />} />
        <Route path="/Logfile" element={<LogfileTable />} />
      </Routes>
    </AuthProvider>
  </Router>
);
