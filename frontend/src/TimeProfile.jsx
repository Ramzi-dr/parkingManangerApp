import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import "./timeProfile.css";
import MyButton from "./components/MyButton";
import { format, addYears } from "date-fns"; // Import date-fns for formatting
import HomeIcon from "@mui/icons-material/Home"; // Material-UI icon
import {
  createTimeProfile,
  getTimeProfiles,
  deleteTimeProfile,
  updateTimeProfile,
} from "./timeProfileManager";
import TimeProfileTable from "./components/TimeProfileTable";
import { updateData } from "./timeProfileUpdater";
const TimeProfile = () => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [openSelect, setOpenSelect] = useState(null);
  const [timeProfileList, setTimeProfileList] = useState([]);
  const [dataChanged, setDataChanged] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getTimeProfiles();

        setTimeProfileList(response);
        setDataChanged(false);
      } catch (error) {
        console.error("Error: ", error);
      }
    };
    fetchData();
  }, [dataChanged]);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#121212",
      color: "white",
      border: "1px solid #ccc",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#62b6cb"
        : state.isFocused
          ? "white"
          : "#455b8bf7",
      color: state.isSelected
        ? "white"
        : state.isFocused
          ? "rgb(148, 33, 33)"
          : "white",
      cursor: "pointer",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "white",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 1000, // Add z-index here to ensure dropdown is above the table header
    }),
  };

  // Start time options without 24:00, ending at 23:45
  const startTimeOptions = Array.from({ length: 96 }, (_, i) => {
    const hours = String(Math.floor(i / 4)).padStart(2, "0");
    const minutes = String((i % 4) * 15).padStart(2, "0");
    return { value: `${hours}:${minutes}`, label: `${hours}:${minutes}` };
  });

  // End time options without 00:00, starting from 00:15
  const endTimeOptions = Array.from({ length: 96 }, (_, i) => {
    const hours = String(Math.floor((i + 1) / 4)).padStart(2, "0");
    const minutes = String(((i + 1) % 4) * 15).padStart(2, "0");
    return { value: `${hours}:${minutes}`, label: `${hours}:${minutes}` };
  });

  const handleSubmit = () => {
    const finalStartTime = startTime || "00:00";
    let finalEndTime = endTime || "23:59";

    // Check for same dates and compare times
    if (startDate && endDate) {
      if (
        startDate.toISOString().split("T")[0] ===
        endDate.toISOString().split("T")[0]
      ) {
        // Adjust for backend submission, treating 24:00 as 00:00 of the next day
        if (finalStartTime > finalEndTime) {
          alert("Error in time: End time must be greater than start time.");
          return;
        }
      }
      if (startDate > endDate) {
        alert("Error in date: End date must be greater than start date.");
        return; // Exit the function to prevent profile creation
      }
    }

    // Format the dates as Swiss format
    const timeProfile = {
      title,
      startDate: startDate
        ? format(startDate, "dd.MM.yyyy")
        : format(new Date(), "dd.MM.yyyy"),
      startTime: `${finalStartTime}:00`,
      endDate: endDate
        ? format(endDate, "dd.MM.yyyy")
        : format(addYears(new Date(), 20), "dd.MM.yyyy"),
      endTime:
        `${finalEndTime}:00` === "24:00:00"
          ? "23:59:59"
          : `${finalEndTime}:00` === "23:59:00"
            ? "23:59:59"
            : `${finalEndTime}:00`,
    };
    addTimeProfile(timeProfile);
  };

  const addTimeProfile = async (timeProfile) => {
    await createTimeProfile(timeProfile);
    setDataChanged(true);
  };

  const handleSelectFocus = (selectName) => {
    if (openSelect !== selectName) {
      setOpenSelect(selectName);
    } else {
      setOpenSelect(null); // Close if the same select is clicked again
    }
  };

  const updateProfile = (id, newData) => {
    updateData(id, newData, updateTimeProfile);
    setDataChanged(true);
  };
  const deleteData = (id) => {
    deleteTimeProfile(id);
    setDataChanged(true);
  };

  const handleBlur = () => {
    setOpenSelect(null);
  };

  const handleTimeSelectChange = (option, type) => {
    if (type === "start") {
      setStartTime(option?.value);
    } else if (type === "end") {
      setEndTime(option?.value);
    }
    setOpenSelect(null); // Collapse the select when a time is selected
  };

  const handleEndDateChange = (date) => {
    if (!startDate) {
      setStartDate(new Date());
    }
    setEndDate(date);
  };

  const getMinStartDate = () => {
    return new Date();
  };

  const getMinEndDate = () => {
    if (startDate) {
      return startDate;
    }
    return new Date();
  };

  const isTitleValid = title.trim().length > 0;

  return (
    <div className="time-profile">
      <br />
      <div className="header-container">
        <h2>Create Time Profile</h2>
      </div>
      <div className="selection-container">
        <div>
          <input
            className="timeProfile-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Please enter a Profile Name* (required)"
            required
          />
        </div>

        <div>
          <label>Start Date:</label>
          <div className="select-container">
            <DatePicker
              className="timeProfile-input"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              minDate={getMinStartDate()}
              onFocus={(e) => e.preventDefault()}
              dateFormat="dd.MM.yyyy"
              placeholderText="Select start date"
              showPopperArrow={false}
              disabled={!isTitleValid}
            />
            <Select
              className="time-select"
              styles={customStyles}
              options={startTimeOptions}
              onChange={(option) => handleTimeSelectChange(option, "start")}
              onFocus={() => handleSelectFocus("startTime")}
              onBlur={handleBlur}
              placeholder="Select start time"
              isClearable
              menuIsOpen={openSelect === "startTime"}
              isDisabled={!isTitleValid}
            />
          </div>
        </div>

        <div>
          <label>End Date:</label>
          <div className="select-container">
            <DatePicker
              className="timeProfile-input"
              selected={endDate}
              onChange={handleEndDateChange}
              minDate={getMinEndDate()}
              dateFormat="dd.MM.yyyy"
              placeholderText="Select end date"
              disabled={!isTitleValid}
            />
            <Select
              className="time-select"
              styles={customStyles}
              options={endTimeOptions}
              onChange={(option) => handleTimeSelectChange(option, "end")}
              onFocus={() => handleSelectFocus("endTime")}
              onBlur={handleBlur}
              placeholder="Select end time"
              isClearable
              menuIsOpen={openSelect === "endTime"}
              isDisabled={!isTitleValid}
            />
          </div>
        </div>
      </div>

      <button
        style={{ backgroundColor: isTitleValid ? "#62b6cb" : "gray" }}
        onClick={handleSubmit}
        disabled={!isTitleValid}
      >
        Create Profile
      </button><div className="table-wrapper">
      <TimeProfileTable
        timeProfileList={timeProfileList}
        updateData={updateProfile}
        deleteData={deleteData}
      />
      </div>
      
      <div className='my-button-container'  >
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

export default TimeProfile;
