/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import  { useState, useEffect } from "react";
import { fetchLogfile } from "../fetchData";
import MyButton from "./MyButton";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import ReactVirtualizedTable from "./ReactVirtualizedTable";




// Function to normalize and sanitize the text for accurate comparison
const normalizeText = (text) => {
  return text
    .toString() // Ensure it's a string
    .trim() // Remove leading/trailing spaces
    .replace(/\s+/g, " ") // Remove extra spaces
    .toLowerCase(); // Convert to lowercase
};





const LogfileTable = () => {
  const [rows, setRows] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchedData = async () => {
      const logData = await fetchLogfile();
      // Sort rows by creation_time (newest first), then reverse them
      const sortedData = logData
        .sort((a, b) => new Date(b.creation_time) - new Date(a.creation_time))
        .reverse(); // Flip the order of the sorted data
      setRows(sortedData);
    };
    fetchedData();
  }, []);


  // Ensure all values are treated as strings for comparison
  const filteredRows = rows.filter((row) => {
    const searchLower = normalizeText(searchValue); // Normalize the search term

    // Normalize plate field for comparison
    const plateValue = normalizeText(row.plate || "");

    // Access field: Convert to "yes" or "no"
    const accessValue = (row.got_access ? "yes" : "no").toLowerCase();

    // Date field: Convert date to string (e.g., YYYY-MM-DD)
    const creationTimeValue = new Date(row.creation_time)
      .toLocaleString() // Converts the date to a string
      .toLowerCase();

    // Check if the search value matches any of the fields
    return (
      plateValue.includes(searchLower) || // Plate field
      accessValue.includes(searchLower) || // Access field
      creationTimeValue.includes(searchLower) // Creation Time field
    );
  });

  return (
    <div>
      {/* Search Input */}
      <div className="search-container">
        <div className="search-box">
          <i className="fa fa-search fa-lg search-icon"></i>
          <input
            className="search-input"
            name="search"
            type="text"
            placeholder="Search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <i
              className="fa fa-times fa-lg clear-icon"
              onClick={() => setSearchValue("")}
            ></i>
          )}
        </div>
      </div>
      <ReactVirtualizedTable rows={filteredRows} />
      <div className="my-button-container">
        <MyButton
          text="home"
          onClick={() => {
            navigate("/");
          }}
          startIcon={<HomeIcon />}
        ></MyButton>
      </div>
    </div>
  );
};

export default LogfileTable;
