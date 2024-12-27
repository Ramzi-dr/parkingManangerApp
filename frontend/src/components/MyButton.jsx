/* eslint-disable react/prop-types */
import Button from "@mui/material/Button";



export default function MyButton({ text, onClick, startIcon, disabled }) {
  const buttonStyle = {
    backgroundColor: text==='disarm'?"red":'#62b6cb',
    mt: 2,
    mb: 2,
    gap: 1,
    width: "100%",
    margin: "1rem",
    marginLeft:"0.1rem",
    marginRight:"0.1rem",
    height: "100%",
    fontSize: window.innerWidth <= 468 ? "11px" : "initial",
  };
  return (
    <Button
      disabled={disabled}
      style={buttonStyle}
      variant="contained"
      startIcon={startIcon}
      onClick={(e) => {
        e.currentTarget.blur();

        onClick(e);
      }}
    >
      {text}
    </Button>
  );
}
