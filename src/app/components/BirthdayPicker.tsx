import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import ListBox, { ListProps } from './ListBox';

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

  const handleDayChange = (val: string | ListProps) => {
    setSelectedDay(val as string);
  };

  const handleMonthChange = (val: string | ListProps) => {
    setSelectedMonth(val as string);
  };

  const handleYearChange = (val: string | ListProps) => {
    setSelectedYear(val as string);
  };

  return (
    <div className='flex flex-col'>
      <h3 className='mb-0.5 pl-1 text-sm text-slate-600'>Birthday</h3>
      <div className='flex space-x-2'>
        <ListBox
          options={months}
          setSelected={handleMonthChange}
          selected={selectedMonth}
        />
        <ListBox
          options={days}
          setSelected={handleDayChange}
          selected={selectedDay}
        />
        <ListBox
          options={years}
          setSelected={handleYearChange}
          selected={selectedYear}
        />
      </div>
    </div>
  );
};

export default BirthdayPicker;
