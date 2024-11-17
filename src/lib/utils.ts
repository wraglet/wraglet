import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const generateUsername = (firstName: string, lastName: string): string => {
  const firstNameWithoutSpaces = firstName.toLowerCase().replace(/\s/g, '')
  const lastNameWithoutSpaces = lastName.toLowerCase().replace(/\s/g, '')
  const randomDigits = Math.floor(Math.random() * 90) + 10 // Generate random two-digit number
  return `@${firstNameWithoutSpaces}${lastNameWithoutSpaces}${randomDigits}`
}