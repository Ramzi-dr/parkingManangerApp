const updateData = (id, newData, updateTimeProfile) => {
  const showAlert = (message) => {
    alert(message);
  };

  // Trim spaces and format times
  newData.startTime = newData.startTime.trim();
  newData.endTime = newData.endTime.trim();
  newData.startDate = newData.startDate.trim();
  newData.endDate = newData.endDate.trim();

  // Validate date and time formats
  const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // For 00:00 to 23:59

  const endTimeRegex = /^(00:[0-5]\d|([01]\d|2[0-3]):([0-5]\d)|24:00)$/; // For 00:05 to 24:00

  if (!dateRegex.test(newData.startDate)) {
    showAlert("Start date format is invalid. Please use DD.MM.YYYY.");
    return;
  }

  if (!dateRegex.test(newData.endDate)) {
    showAlert("End date format is invalid. Please use DD.MM.YYYY.");
    return;
  }

  if (!timeRegex.test(newData.startTime)) {
    showAlert(
      "Start time format is invalid. Please use a time between 00:00 and 23:59."
    );
    return;
  }

  if (!endTimeRegex.test(newData.endTime)) {
    showAlert(
      "End time format is invalid. Please use a time between 00:05 and 24:00."
    );
    return;
  }

  // Ensure start time is between 00:00 and 23:59
  const [startHour, startMinute] = newData.startTime.split(":").map(Number);
  if (startHour < 0 || startHour > 23 || startMinute < 0 || startMinute > 59) {
    showAlert("Start time must be between 00:00 and 23:59.");
    return;
  }

  // Ensure end time is between 00:05 and 24:00
  const [endHour, endMinute] = newData.endTime.split(":").map(Number);
  if ((endHour === 0 && endMinute < 5) || endHour > 24 || endMinute > 59) {
    showAlert("End time must be between 00:05 and 24:00.");
    return;
  }

  // Create date objects
  const startDateTime = new Date(
    `${newData.startDate.split(".").reverse().join("-")}T${newData.startTime}:00`
  );
  const endDateTime = new Date(
    `${newData.endDate.split(".").reverse().join("-")}T${newData.endTime === "24:00" ? "23:59:59" : `${newData.endTime}:00`}`
  ); // Convert 24:00 to 23:59:59 to represent midnight of the next day

  // Validate current date
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  if (startDateTime < currentDate) {
    showAlert("Start date must be today or later.");
    return;
  }

  if (endDateTime < currentDate) {
    showAlert("End date must be today or later.");
    return;
  }

  // Check if endDateTime is less than startDateTime
  if (endDateTime < startDateTime) {
    showAlert(
      "End date and time must be the same day or later than the start date and time."
    );
    return;
  }

  // Check if start time is greater than end time on the same day
  if (startDateTime.toDateString() === endDateTime.toDateString()) {
    if (endDateTime.getTime() <= startDateTime.getTime()) {
      showAlert("End time must be later than start time on the same day.");
      return;
    }
  }

  newData.startTime = `${newData.startTime}:00`;
  newData.endTime = `${newData.endTime}:00`;
  if (newData.startTime === "24:00:00") {
    newData.startTime = "23:55:00";
  }
  if (newData.endTime === "24:00:00") {
    console.log("newData");
    newData.endTime = "23:59:59";
  }

  console.log(newData);
  updateTimeProfile(id, newData);
};

export { updateData };
