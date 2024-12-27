import { useState, useEffect } from "react";
import "./timeProfileSelector.css";
import { getTimeProfiles } from "../timeProfileManager";
import PropTypes from "prop-types";

const TimeProfileSelector = ({ selectedTimeProfiles }) => {
  const [timeProfileList, setTimeProfileList] = useState([]);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleTimeProfileSelect = (profile) => {
    setSelectedProfiles((prev) => {
      const updatedProfiles = prev.includes(profile)
        ? prev.filter((p) => p !== profile)
        : [...prev, profile];
      handleConfirmSelection(updatedProfiles);
      return updatedProfiles;
    });
  };

  const handleConfirmSelection = (updatedProfiles) => {
    if (selectedTimeProfiles) {
      selectedTimeProfiles(updatedProfiles);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getTimeProfiles();
        setTimeProfileList(response);
      } catch (error) {
        console.error("Error: ", error);
      }
    };
    fetchData();
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="time-container">
      <div className="time-selector" style={{ width: "140px" }} onClick={handleOpen}>
        <div className="time-display">Time Profile</div>
      </div>

      {isOpen && (
        <div className="modal" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <span className="close-button" onClick={handleClose}>
              &times;
            </span>

            <div className="wheel-container">
              {timeProfileList.map((profile) => (
                <div
                  key={profile.id}
                  className={`profile-option ${selectedProfiles.includes(profile) ? "selected" : ""}`}
                  onClick={() => handleTimeProfileSelect(profile)}
                >
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selectedProfiles.includes(profile)}
                    readOnly
                  />
                  <span>{profile.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

TimeProfileSelector.propTypes = {
  selectedTimeProfiles: PropTypes.func,
};

export default TimeProfileSelector;
