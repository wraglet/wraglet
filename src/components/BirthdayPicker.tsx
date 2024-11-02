import { useEffect, useMemo, useState } from 'react'

import ListBox, { ListProps } from '@/components/ListBox'

interface BirthdayPickerProps {
  dateSetter: (val: Date) => void
  date: Date
}

const BirthdayPicker = ({ dateSetter, date }: BirthdayPickerProps) => {
  const days = Array.from({ length: 31 }, (_, index) => (index + 1).toString())
  // Calculate the minimum and maximum birth years
  const currentYear = new Date().getFullYear()
  const minimumBirthYear = currentYear - 100
  const maximumBirthYear = currentYear - 13

  // Generate the years array dynamically
  const years = useMemo(
    () =>
      Array.from(
        { length: maximumBirthYear - minimumBirthYear + 1 },
        (_, index) => (maximumBirthYear - index).toString()
      ).reverse(),
    [minimumBirthYear, maximumBirthYear]
  )

  const [selectedDay, setSelectedDay] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')

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
  )

  // Update the useEffect to set selected year within the range
  useEffect(() => {
    const currentDate = new Date()
    setSelectedDay(currentDate.getDate().toString())
    setSelectedMonth(months[currentDate.getMonth()]) // Get abbreviated month name

    // Ensure selected year is within the calculated range
    const selectedYear = Math.max(
      minimumBirthYear,
      Math.min(maximumBirthYear, currentDate.getFullYear() - 13)
    )
    setSelectedYear(selectedYear.toString())

    // Set initial values from the date prop if dateSetter has a value
    if (date) {
      const initialDate = new Date(date)
      setSelectedDay(initialDate.getDate().toString())
      setSelectedMonth(months[initialDate.getMonth()])
      setSelectedYear(initialDate.getFullYear().toString())
    }
  }, [months, minimumBirthYear, maximumBirthYear, dateSetter, date])

  const handleDayChange = (val: string | ListProps) => {
    setSelectedDay(val as string)
    updateDate(val as string, selectedMonth, selectedYear)
  }

  const handleMonthChange = (val: string | ListProps) => {
    setSelectedMonth(val as string)
    updateDate(selectedDay, val as string, selectedYear)
  }

  const handleYearChange = (val: string | ListProps) => {
    setSelectedYear(val as string)
    updateDate(selectedDay, selectedMonth, val as string)
  }

  const updateDate = (day: string, month: string, year: string) => {
    const selectedDate = new Date(`${month} ${day}, ${year}`)
    dateSetter(selectedDate)
  }

  return (
    <div className="flex flex-col">
      <h3 className="mb-0.5 pl-1 text-sm text-slate-600">Birthday</h3>
      <div className="flex space-x-2">
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
  )
}

export default BirthdayPicker
