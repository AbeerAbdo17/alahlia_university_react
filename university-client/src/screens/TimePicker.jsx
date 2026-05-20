// TimePicker.jsx
import React, { useState, useEffect } from "react";

const TimePicker = ({ value = "08:00", onChange, disabled = false }) => {
  const [time, setTime] = useState(value);

  useEffect(() => {
    setTime(value);
  }, [value]);

  const handleChange = (e) => {
    const newTime = e.target.value;
    setTime(newTime);
    onChange(newTime);
  };

  return (
    <input
      type="time"
      className="input-field"
      value={time}
      onChange={handleChange}
      disabled={disabled}
      style={{ fontSize: "16px", padding: "12px" }}
    />
  );
};

export default TimePicker;