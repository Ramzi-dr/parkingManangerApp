/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import MyButton from "./MyButton";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DoneIcon from "@mui/icons-material/Done";
import SweetAlert from "./SweetAlert";
import DaysCheckBox from "./DaysCheckBox";
import TimeSelector from "./TimeSelector";
import TimeProfileSelector from "./TimeProfileSelector";
import DriveEtaIcon from "@mui/icons-material/DirectionsCar"; // or DriveEtaIcon
UpdateForm.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  data: PropTypes.object.isRequired,
  fields: PropTypes.arrayOf(PropTypes.string).isRequired,
  success: PropTypes.func.isRequired,
  updateData: PropTypes.func.isRequired,
  deleteData: PropTypes.func.isRequired,
  isTimeProfile: PropTypes.bool,
  isCar: PropTypes.bool,
};

export default function UpdateForm({
  id,
  data,
  fields,
  success,
  updateData,
  deleteData,
  isTimeProfile,
  isCar,
}) {
  const [newData, setNewData] = useState(data);
  const [statusError, setStatusError] = useState(null);
  const [checkedDays, setCheckedDays] = useState([]);
  const [accessTime, setAccessTime] = useState({});
  useEffect(() => {
    console.log("data in update form ", data);
  }, []);
  //function for cars
  function accessDays(checkedDays) {
    setCheckedDays(checkedDays);
    console.log("from accessDays inside updateForm ", checkedDays);
  }
  function accessTimeUpdate(accessTime) {
    setAccessTime(accessTime);
    console.log("from accessTimeUpdate inside updateForm ", accessTime);
  }

  const handleInputOnChange = (event) => {
    const { name, value } = event.target;

    if (name === "status") {
      const validStatuses = ["active", "inactive"];
      const inputLower = value.toLowerCase();

      if (!validStatuses.includes(inputLower) && inputLower !== "") {
        setStatusError("Status must be 'active' or 'inactive'");
      } else {
        setStatusError(null);
      }
    }

    setNewData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDelete = async (event) => {
    const userConfirmed = window.confirm("Are you sure you want to delete?");
    if (userConfirmed) {
      try {
        await deleteData(id, newData.email);
        success(event);
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  const isValidEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const hasChanges = fields.some((field) => newData[field] !== data[field]);

    for (const field of fields) {
      if (!newData[field] || newData[field].length < 1) {
        SweetAlert("alert", `${field} can't be empty.`);
        return;
      }

      if (field === "email" && !isValidEmail(newData[field])) {
        SweetAlert("alert", "Invalid email format.");
        return;
      }
    }

    if ("carLicencePlate" in newData) {
      if (newData.carLicencePlate.length < 4) {
        SweetAlert(
          "alert",
          "Invalid car Plate. Must be bigger than 3 characters."
        );
        return;
      }
    }

    if ("status" in newData && newData.status && statusError) {
      SweetAlert("alert", "Please correct the status field.");
      return;
    }

    if (hasChanges) {
      if ("email" in newData && newData.email !== data.email) {
        const newDataWithNewEmail = {
          ...newData,
          new_email: newData.email,
        };
        delete newDataWithNewEmail.email; // Remove old email for the update
        try {
          await updateData(id, newDataWithNewEmail);
          success(event);
        } catch (error) {
          console.error("Error updating data:", error);
          SweetAlert("alert", "Failed to update data.");
        }
      } else {
        try {
          await updateData(id, newData);
          success(event);
        } catch (error) {
          console.error("Error updating data:", error);
          SweetAlert("alert", "Failed to update data.");
        }
      }
    } else {
      SweetAlert("info", "No changes made.");
      success(event);
    }
  };

  return (
    <div className="update-container" onClick={(e) => e.stopPropagation()}>
      <form onSubmit={handleSubmit}>
        <div className="form-fields-container">
          {fields.map((field) => (
            <div className="form-field" key={field}>
              <input
                type="text"
                name={field}
                value={newData[field] || ""}
                onChange={handleInputOnChange}
                placeholder={field}
                required
                minLength={2}
              />
              {field === "status" && statusError && (
                <div className="error-message">{statusError}</div>
              )}
            </div>
          ))}
        </div>
        <div className="form-field">
       {/*    {isCar ? (<div></div> /// delete this if u want to activate time and date functionality
            <div style={{ display: "grid", placeItems: "center" }}>
              <DaysCheckBox accessDays={accessDays} initialSelectedDays={data.days || []} />
              <div
                style={{
                  justifyContent: "space-between",
                  display: "flex",
                  width: "180px",
                  marginTop: "10px",
                }}
              >
                <span>Start time</span>
                <span>End time</span>
              </div>
              <div style={{ width: "15rem" }}>
                <TimeSelector accessTimeUpdater={accessTimeUpdate}
                initialTime={{ startTime: data.accessTime.startTime || "00:00", endTime: data.accessTime.endTime || "23:59" }} />
              </div>
            </div>
          ) : (
            <></>
          )} */}
          <div className="submit-container">
            <MyButton
              text="Update"
              onClick={handleSubmit}
              startIcon={<DoneIcon />}
            />
            {isTimeProfile ? (
              <MyButton
                disabled={true}
                text="cars"
                onClick={handleDelete}
                startIcon={<DriveEtaIcon />}
              />
            ) : (
              <></>
            )}
            <MyButton
              text="delete"
              onClick={handleDelete}
              startIcon={<DeleteForeverIcon />}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
