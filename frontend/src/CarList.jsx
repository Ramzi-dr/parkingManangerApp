import { useState, useRef, useContext, useEffect } from "react";
import ContextMenu from "./components/ContextMenu"; // Ensure you're importing the updated ContextMenu
import { DataTableContext } from "./components/DataTable";

import "./carList.css";

export default function CarList() {
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    x: 0,
    y: 0,
    carId: null,
  });

  const { filteredData, handleUpdate, handleDelete, checkFilteredData } =
    useContext(DataTableContext);

  const scrollableContainerRef = useRef(null);
  const [touchTimer, setTouchTimer] = useState(null);

  const handleContextMenu = (event, id) => {
    event.preventDefault();
    const containerRect =
      scrollableContainerRef.current.getBoundingClientRect();
    const scrollTop = scrollableContainerRef.current.scrollTop;
    const scrollLeft = scrollableContainerRef.current.scrollLeft;
    const xPosition = event.clientX - containerRect.left + scrollLeft;
    const yPosition = event.clientY - containerRect.top + scrollTop;

    setContextMenu({
      isOpen: true,
      x: xPosition,
      y: yPosition,
      carId: id,
    });
  };

  const closeContextMenu = (e) => {
    setContextMenu({ isOpen: false, x: 0, y: 0, carId: null });
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

  const updateCarData = async (id, newCarData) => {
    try {
      await handleUpdate(id, newCarData);
      setContextMenu({ isOpen: false, x: 0, y: 0, carId: null });
    } catch (error) {
      console.error("Error updating car:", error);
    }
  };
  useEffect(() => {
    console.log("checkFilteredData ", checkFilteredData);
  });

  const deleteCarData = async (id) => {
    try {
      await handleDelete(id);
      setContextMenu({ isOpen: false, x: 0, y: 0, carId: null });
    } catch (error) {
      console.error("Error deleting car:", error);
    }
  };

  return (
    <div className="white-list" onClick={closeContextMenu}>
      {checkFilteredData && filteredData.length > 0 ? (
        <div className="scrollable-container" ref={scrollableContainerRef}>
          <div className="car-list">
            {checkFilteredData.map((data) => (
              <div
                key={data.id} // Use carId as key
                className="car-item"
                onContextMenu={(event) => handleContextMenu(event, data.id)}
                onTouchStart={(e) => handleTouchStart(e, data.id)}
                onTouchEnd={handleTouchEnd}
              >
                <span className="car-name">
                  <span className="first-name">{data.firstName}</span>{" "}
                  <span className="last-name">{data.lastName}</span>
                </span>
                <span className="car-plate">{data.carLicencePlate}</span>
                {contextMenu.isOpen && contextMenu.carId === data.id && (
                  <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    data={{
                      carLicencePlate: data.carLicencePlate,
                      firstName: data.firstName,
                      lastName: data.lastName,
                      accessTime: data.accessTime,
                      days: data.days,
                    }}
                    fields={["carLicencePlate", "firstName", "lastName"]}
                    id={data.id} // Pass the carId
                    success={closeContextMenu}
                    updateData={updateCarData} // Pass updateCarData function
                    deleteData={deleteCarData}
                    containerRef={scrollableContainerRef}
                    isCar
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
