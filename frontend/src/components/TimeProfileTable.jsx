import "./timeProfileTable.css";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useState, useRef } from "react";
import ContextMenu from "./ContextMenu";
import PropTypes from "prop-types";
TimeProfileTable.propTypes = {
  timeProfileList: PropTypes.array,
  updateData: PropTypes.func,
  deleteData: PropTypes.func,
};
export default function TimeProfileTable({
  timeProfileList,
  updateData,
  deleteData,
}) {
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    data: null,
    position: { x: 0, y: 0 },
  });
  const [touchTimer, setTouchTimer] = useState(null);
  const scrollableContainerRef = useRef(null);

  const handleContextMenu = (event, profile) => {
    event.preventDefault();
    event.stopPropagation(); // Stop the event from bubbling up
    const containerRect =
      scrollableContainerRef.current.getBoundingClientRect();
    const scrollTop = scrollableContainerRef.current.scrollTop;
    const scrollLeft = scrollableContainerRef.current.scrollLeft;
    const xPosition = event.clientX - containerRect.left + scrollLeft;
    const yPosition = event.clientY - containerRect.top + scrollTop;

    setContextMenu({
      visible: true,
      data: profile, // Store the profile data for the context menu
      position: { x: xPosition, y: yPosition },
    });
  };

  const handleTouchStart = (event, profile) => {
    const timer = setTimeout(() => {
      handleContextMenu(event, profile);
    }, 1000);
    setTouchTimer(timer);
  };

  const handleTouchEnd = () => {
    clearTimeout(touchTimer);
  };

  const closeContextMenu = (e) => {
    setContextMenu({ visible: false, data: null, position: { x: 0, y: 0 } });
    if (e) {
      e.preventDefault();
    }
  };

  return (
    <div className="time-profile-container" onClick={closeContextMenu}>
      <TableContainer component={Paper} className="table-container">
        <Table aria-label="time profiles table" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Start Date & Time</TableCell>
              <TableCell>End Date & Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody ref={scrollableContainerRef}>
            {timeProfileList.map((profile) => (
              <TableRow
                key={profile.id}
                onContextMenu={(event) => handleContextMenu(event, profile)}
                onTouchStart={(e) => handleTouchStart(e, profile)}
                onTouchEnd={handleTouchEnd}
                onClick={()=>{ console.log(profile.id)}}
              >
                <TableCell style={{ textAlign: "center" }}>
                  {profile.title}
                </TableCell>
                <TableCell style={{ textAlign: "center" }}>
                  {profile.startDate}&nbsp;&nbsp;
                  {profile.startTime}
                </TableCell>
                <TableCell style={{ textAlign: "center" }}>
                  {profile.endDate}&nbsp;&nbsp;
                  {profile.endTime}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Render ContextMenu if visible */}
      {contextMenu.visible && (
        <ContextMenu
          data={contextMenu.data}
          fields={["title", "startDate", "startTime", "endDate", "endTime"]} // Adjust fields as necessary
          id={contextMenu.data.id}
          success={closeContextMenu}
          updateData={updateData}
          deleteData={deleteData}
          x={contextMenu.position.x}
          y={contextMenu.position.y}
          isTimeProfile
        />
      )}
    </div>
  );
}
