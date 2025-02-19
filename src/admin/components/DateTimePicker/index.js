import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parseISO } from 'date-fns';

const CustomDateTimePicker = ({ value, onChange, ...props }) => {
  const handleChange = (date) => {
    // Send the selected date in ISO format to Strapi
    onChange(date.toISOString());
  };

  const selectedDate = value ? parseISO(value) : null;

  return (
    <DatePicker
      selected={selectedDate}
      onChange={handleChange}
      showTimeSelect
      timeFormat="h:mm aa"
      timeIntervals={15}
      dateFormat="MM/dd/yyyy h:mm aa"
      {...props}
    />
  );
};

export default CustomDateTimePicker;
