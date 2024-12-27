import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import UpdateForm from "./UpdateForm"; // Import the new UpdateForm

ContextMenu.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  containerRef: PropTypes.object,
  data: PropTypes.object.isRequired, // Generic data object
  fields: PropTypes.arrayOf(PropTypes.string).isRequired, // Fields to edit
  success: PropTypes.func.isRequired,
  updateData: PropTypes.func.isRequired,
  deleteData: PropTypes.func.isRequired,
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  isTimeProfile: PropTypes.bool,
  isCar: PropTypes.bool,
};

export default function ContextMenu({
  data,
  fields,
  id,
  success,
  updateData,
  deleteData,
  isTimeProfile,
  isCar
}) {
  const [position] = useState({
    hight: '50%',
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  });
  const menuRef = useRef(null);

  // Step 1: Close menu when clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        success();  // Close the menu
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, success]);

  return (
    <div className="context-menu" ref={menuRef} style={position}>
      <span
        className="dismiss-button"
        onClick={success}
        style={{
          position: "absolute",
          right: "1rem",
          top: "0.2rem",
          cursor: "pointer",
          fontSize: "2rem",
          fontWeight: "bold",
          color: "#333",
        }}
      >
        &times;
      </span>

      <UpdateForm
        id={id}
        data={data}
        fields={fields}
        success={success}
        updateData={updateData}
        deleteData={deleteData}
        isTimeProfile={isTimeProfile}
        isCar={isCar}
      />
    </div>
  );
}
