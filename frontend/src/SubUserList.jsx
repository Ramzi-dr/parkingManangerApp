import { useState, useRef, useContext } from "react";
import PropTypes from "prop-types";
import ContextMenu from "./components/ContextMenu";
import { DataTableContext } from "./components/DataTable";

import "./subUserList.css"; // Import the new CSS for SubUserList

export default function SubUserList() {
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    x: 0,
    y: 0,
    subUserId: null,
  });

  const { filteredData, handleUpdate, handleDelete, checkFilteredData } =
    useContext(DataTableContext);

  const scrollableContainerRef = useRef(null);
  const [touchTimer, setTouchTimer] = useState(null);

  const handleContextMenu = (event, id) => {
    event.preventDefault();
    const containerRect = scrollableContainerRef.current.getBoundingClientRect();
    const scrollTop = scrollableContainerRef.current.scrollTop;
    const scrollLeft = scrollableContainerRef.current.scrollLeft;
    const xPosition = event.clientX - containerRect.left + scrollLeft;
    const yPosition = event.clientY - containerRect.top + scrollTop;

    setContextMenu({
      isOpen: true,
      x: xPosition,
      y: yPosition,
      subUserId: id,
    });
  };

  const closeContextMenu = (e) => {
    setContextMenu({ isOpen: false, x: 0, y: 0, subUserId: null });
    if (e) {
      e.preventDefault();
    }
  };

  const handleTouchStart = (event, id) => {
    const timer = setTimeout(() => {
      handleContextMenu(event, id);
    }, 1000);
    setTouchTimer(timer);
  };

  const handleTouchEnd = () => {
    clearTimeout(touchTimer);
  };

  const updateSubUserData = async ( id,newSubUserData) => {
    try {
      await handleUpdate(id, newSubUserData);
      setContextMenu({ isOpen: false, x: 0, y: 0, subUserId: null });
    } catch (error) {
      console.error("Error updating sub-user:", error);
    }
  };

  const deleteSubUserData = async (id, subUserEmail) => {
    try {
      await handleDelete( id,subUserEmail);
      setContextMenu({ isOpen: false, x: 0, y: 0, subUserId: null });
    } catch (error) {
      console.error("Error deleting sub-user:", error);
    }
  };

  return (
    <div className="sub-user-list" onClick={closeContextMenu}>
      {checkFilteredData && filteredData.length > 0 ? (
        <div className="scrollable-container" ref={scrollableContainerRef}>
          <div className="sub-user-items">
            {checkFilteredData.map((data) => (
              <div
                key={data.id}
                className="sub-user-item"
                onContextMenu={(event) => handleContextMenu(event, data.id)}
                onTouchStart={(e) => handleTouchStart(e, data.id)}
                onTouchEnd={handleTouchEnd}
              >
                {/* Top row for first and last name */}
                <div className="sub-user-name">
                  <span className="first-name">{data.first_name || "No first name"}</span>
                  <span className="last-name">{data.last_name || "No last name"}</span>
                </div>
                {/* Bottom row for email and status */}
                <div className="sub-user-details">
                  <span className="sub-user-email no-underline">{data.email}</span>
                  <span className={`sub-user-status no-underline ${data.status}`}>
                    {data.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
                {contextMenu.isOpen && contextMenu.subUserId === data.id && (
                  <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    data={{
                      email: data.email,
                      first_name: data.first_name,
                      last_name: data.last_name,
                      status: data.status,
                    }}
                    fields={["email", "first_name", "last_name", "status"]}
                    id={data.id}
                    success={closeContextMenu}
                    updateData={updateSubUserData}
                    deleteData={deleteSubUserData}
                    containerRef={scrollableContainerRef}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>No data available</div>
      )}
    </div>
  );
}

SubUserList.propTypes = {
  filteredData: PropTypes.array,
  handleSubUserUpdate: PropTypes.func,
  handleSubUserDelete: PropTypes.func,
};
