/* eslint-disable react/prop-types */
import { createContext, useState } from "react";
import "./searchInput.css";
import CarList from "../CarList";
import SubUserList from "../SubUserList";

export const DataTableContext = createContext();

export default function DataTable({
  filteredData,
  handleUpdate,
  handleDelete,
  type,
}) {
  const noDataText = [{ first_name: "oops nothing found" }];
  const [searchValue, setSearchValue] = useState("");

  const keys =
    type === "car"
      ? ["firstName", "lastName", "carLicencePlate"]
      : ["first_name", "last_name", "email", "status"]; // Include status for sub-users

  const handleChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
  };

  const reFilteredData = filteredData
    .filter((item) =>
      keys.some((key) =>
        (item[key] || "").toLowerCase().includes(searchValue.toLowerCase())
      )
    )
    .sort((a, b) => (a.first_name || "").localeCompare(b.first_name || ""));

  const checkFilteredData =
    reFilteredData.length > 0 ? reFilteredData : noDataText;

  return (
    <div>
      <div className="search-container">
        <div className="search-box">
          <i className="fa fa-search fa-lg search-icon"></i>
          <input
            className="search-input"
            name="search"
            type="text"
            placeholder="Search"
            value={searchValue}
            onChange={handleChange}
          />
          {searchValue && (
            <i
              className="fa fa-times fa-lg clear-icon"
              onClick={() => setSearchValue("")}
            ></i>
          )}
        </div>
      </div>
      <DataTableContext.Provider
        value={{ filteredData, handleUpdate, handleDelete, checkFilteredData }}
      >
        {type === "car" ? (
          <CarList />
        ) : (
          <SubUserList /> // Render SubUserList for sub-users
        )}
      </DataTableContext.Provider>
    </div>
  );
}
