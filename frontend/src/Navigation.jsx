import { Link } from "react-router-dom";

export default function Navigation() {
  return (
    <nav>
      <Link to="/"> </Link>
      <Link to="/AddCar">Add Car</Link>
      <Link to="/Login">Login</Link>
      <Link to="/Register">Register</Link>
      <Link to="/Account">Account</Link>
      <Link to="/Users">Users</Link>
      <Link to="/AddUser">AddUser</Link>
      <Link to="/TimeProfile">TimeProfile</Link>
      <Link to="/LogfileTable">LogfileTable</Link>
    </nav>
  );
}

//frontend/src/login/Register.jsx
