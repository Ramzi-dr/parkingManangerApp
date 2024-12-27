import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./timeSelector.css";

const TimeSelector = ({ accessTimeUpdater, initialTime }) => {
  const [times, setTimes] = useState([]);
  const [startTime, setStartTime] = useState(initialTime?.startTime || "00:00"); // Use initialTime if provided
  const [endTime, setEndTime] = useState(initialTime?.endTime || "24:00"); // Use initialTime if provided
  const [isOpen, setIsOpen] = useState(false);
  const [accessTimeChanged, setAccessTimeChanged] = useState(false);
  const [currentSelector, setCurrentSelector] = useState("start");

  // Generate times from 00:00 to 24:00 with 15-minute intervals
  useEffect(() => {
    const generatedTimes = [];
    for (let hour = 0; hour <= 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 24 && minute > 0) break;
        const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        generatedTimes.push(time);
      }
    }
    setTimes(generatedTimes);
  }, []);

  const handleOpen = (selector) => {
    setCurrentSelector(selector);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleTimeSelect = (time) => {
    if (currentSelector === "start") {
      setStartTime(time);
    } else {
      setEndTime(time);
    }
    handleClose();
  };

  // Convert time for sending to backend
  const convertTimeToBackendFormat = (time) => {
    if (time === "24:00") return "23:59:59";
    return time + ":00";
  };

  const getSelectedTimes = () => {
    const startInMinutes =
      parseInt(startTime.split(":")[0]) * 60 +
      parseInt(startTime.split(":")[1]);
    const endInMinutes =
      parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);

    if (startInMinutes >= endInMinutes) {
      alert("Start time must be less than end time.");
      return null;
    }

    return {
      startTime: convertTimeToBackendFormat(startTime),
      endTime: convertTimeToBackendFormat(endTime),
    };
  };

  useEffect(() => {
    const selectedTimes = getSelectedTimes();
    if (accessTimeChanged) {
      accessTimeUpdater(selectedTimes || {
        startTime: "00:00:00",
        endTime: "23:59:59",
      });
    }
    setAccessTimeChanged(false);
  }, [accessTimeChanged, accessTimeUpdater, startTime, endTime]);

  useEffect(() => {
    setAccessTimeChanged(true);
  }, [startTime, endTime]);

  return (
    <div className="time-container">
      <div className="time-selector" onClick={() => handleOpen("start")}>
        <div className="time-display">{startTime}</div>
      </div>

      <div className="time-selector" onClick={() => handleOpen("end")}>
        <div className="time-display">{endTime}</div>
      </div>

      {isOpen && (
        <div className="modal" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="wheel-container">
              {times.map((time) => (
                <div
                  key={time}
                  className={`time-option ${time === (currentSelector === "start" ? startTime : endTime) ? "selected" : ""}`}
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

TimeSelector.propTypes = {
  accessTimeUpdater: PropTypes.func,
  initialTime: PropTypes.shape({
    startTime: PropTypes.string,
    endTime: PropTypes.string,
  }),
};

export default TimeSelector;


