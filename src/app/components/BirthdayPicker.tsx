import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import ComboBox from './ComboBox';

const BirthdayPicker = () => {
  const days = Array.from({ length: 31 }, (_, index) => (index + 1).toString());
  // Calculate the minimum and maximum birth years
  const currentYear = new Date().getFullYear();
  const minimumBirthYear = currentYear - 100;
  const maximumBirthYear = currentYear - 13;

  // Generate the years array dynamically
  const years = useMemo(
    () =>
      Array.from(
        { length: maximumBirthYear - minimumBirthYear + 1 },
        (_, index) => (maximumBirthYear - index).toString()
      ).reverse(),
    [minimumBirthYear, maximumBirthYear]
  );

  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const months = useMemo(
    () => [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ],
    []
  );

  // Update the useEffect to set selected year within the range
  useEffect(() => {
    const currentDate = new Date();
    setSelectedDay(currentDate.getDate().toString());
    setSelectedMonth(months[currentDate.getMonth()]); // Get abbreviated month name

    // Ensure selected year is within the calculated range
    const selectedYear = Math.max(
      minimumBirthYear,
      Math.min(maximumBirthYear, currentDate.getFullYear() - 13)
    );
    setSelectedYear(selectedYear.toString());
  }, [months, minimumBirthYear, maximumBirthYear]);

  const handleDayChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedDay(event.target.value);
  };

  const handleMonthChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedYear(event.target.value);
  };

  return (
    <div className='flex flex-col'>
      <h3 className='mb-0.5 pl-1 text-sm text-slate-600'>Birthday</h3>
      <div className='flex space-x-2'>
        <ComboBox
          options={months}
          onChange={handleMonthChange}
          value={selectedMonth}
        />
        <ComboBox
          options={days}
          onChange={handleDayChange}
          value={selectedDay}
        />
        <ComboBox
          options={years}
          onChange={handleYearChange}
          value={selectedYear}
        />
      </div>
    </div>
  );
};

export default BirthdayPicker;
