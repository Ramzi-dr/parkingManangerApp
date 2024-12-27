import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { TableVirtuoso } from "react-virtuoso";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
const columns = [
  { width: 100, label: "Plate", dataKey: "plate", align: "center" },
  {
    width: 100,
    label: "Access Granted",
    dataKey: "got_access",
    align: "center",
  },
  {
    width: 100,
    label: "Creation Time",
    dataKey: "creation_time",
    align: "center",
  },
];

const VirtuosoTableComponents = {
  Scroller: React.forwardRef((props, ref) => (
    <TableContainer component={Paper} {...props} ref={ref} />
  )),
  Table: React.forwardRef((props, ref) => (
    <Table
      {...props}
      sx={{ borderCollapse: "separate", tableLayout: "fixed" }}
      ref={ref} // forward the ref to Table component
    />
  )),
  TableHead: React.forwardRef((props, ref) => (
    <TableHead {...props} ref={ref} />
  )),
  TableRow: TableRow,
  TableBody: React.forwardRef((props, ref) => (
    <TableBody {...props} ref={ref} />
  )),
};

// Assign display names to each component to avoid ESLint warning
VirtuosoTableComponents.Scroller.displayName = "VirtuosoTableScroller";
VirtuosoTableComponents.Table.displayName = "VirtuosoTable";
VirtuosoTableComponents.TableHead.displayName = "VirtuosoTableHead";
VirtuosoTableComponents.TableBody.displayName = "VirtuosoTableBody";

export default function ReactVirtualizedTable({ rows }) {
  const [tableHeight, setTableHeight] = useState("100px");

  useEffect(() => {
    const calculatedHeight = Math.min(rows.length * 100, 420); // Calculate the new height
    setTableHeight(`${calculatedHeight}px`); // Set the new height
  }, [rows.length]);

  function fixedHeaderContent() {
    return (
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.dataKey}
            variant="head"
            align="center"
            style={{ width: column.width }}
            sx={{ backgroundColor: "background.paper" }}
          >
            {column.label}
          </TableCell>
        ))}
      </TableRow>
    );
  }

  function rowContent(_index, logData) {
    const textColor = logData.got_access ? "inherit" : "#900C3F";
    return (
      <React.Fragment>
        {columns.map((column) => {
          let value = logData[column.dataKey];
          if (column.dataKey === "got_access") {
            value = value ? "Yes" : "No";
          }
          return (
            <TableCell
              key={column.dataKey}
              align="center"
              sx={{ color: textColor, fontWeight: "bold" }}
            >
              {value}
            </TableCell>
          );
        })}
      </React.Fragment>
    );
  }

  return (
    <Paper
      style={{
        height: tableHeight,
        width: "90%",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <TableVirtuoso
        data={rows}
        components={VirtuosoTableComponents}
        fixedHeaderContent={fixedHeaderContent}
        itemContent={rowContent}
      />
    </Paper>
  );
}

ReactVirtualizedTable.propTypes = {
  rows: PropTypes.array,
};
