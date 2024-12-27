import { useState, useEffect } from "react";
import PropTypes from "prop-types";

DaysCheckBox.propTypes = {
  accessDays: PropTypes.func,
  initialSelectedDays: PropTypes.arrayOf(PropTypes.string), // New prop for initial selected days
};

export default function DaysCheckBox({ accessDays, initialSelectedDays }) {
  const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const [checkedItems, setCheckedItems] = useState(
    initialSelectedDays && initialSelectedDays.length > 0
      ? weekdays.map((day) => initialSelectedDays.includes(day))
      : new Array(weekdays.length).fill(true) // Default: all days checked
  );

  useEffect(() => {
    const checkedIndexes = checkedItems
      .map((isChecked, idx) => (isChecked ? weekdays[idx] : null))
      .filter(Boolean);
    accessDays(checkedIndexes);
  }, [checkedItems, accessDays]);

  const handleCheckboxChange = (index) => {
    const updateCheckedItems = [...checkedItems];
    updateCheckedItems[index] = !updateCheckedItems[index];
    setCheckedItems(updateCheckedItems);

    const checkedIndexes = updateCheckedItems
      .map((isChecked, idx) => (isChecked ? weekdays[idx] : null))
      .filter(Boolean);
    accessDays(checkedIndexes);
  };

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      {weekdays.map((day, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <label style={{ minWidth: "25px", textAlign: "center" }}>{day}</label>
          <input
            type="checkbox"
            style={{ color: "red" }}
            checked={checkedItems[index]}
            onChange={() => handleCheckboxChange(index)}
          />
        </div>
      ))}
    </div>
  );
}
