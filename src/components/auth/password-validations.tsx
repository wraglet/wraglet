const getValidationMessages = (password: string) => {
  const messages: string[] | null = []
  if (password.length < 1) {
    return null
  }
  if (password.length >= 8) {
    messages.push('✔️ must be at least 8 characters')
  } else {
    messages.push('❌ must be at least 8 characters')
  }
  if (/[A-Z]/.test(password)) {
    messages.push('✔️ must contain at least one uppercase letter')
  } else {
    messages.push('❌ must contain at least one uppercase letter')
  }
  if (/[a-z]/.test(password)) {
    messages.push('✔️ must contain at least one lowercase letter')
  } else {
    messages.push('❌ must contain at least one lowercase letter')
  }
  if (/[0-9]/.test(password)) {
    messages.push('✔️ must contain at least one number')
  } else {
    messages.push('❌ must contain at least one number')
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    messages.push('✔️ must contain at least one special character')
  } else {
    messages.push('❌ must contain at least one special character')
  }
  return messages
}

const getConfirmPasswordMessage = (
  newPassword: string,
  confirmPassword: string
) => {
  if (confirmPassword.length === 0) {
    return ''
  }
  if (newPassword === confirmPassword) {
    return '✔️ Passwords match'
  } else {
    return '❌ Passwords do not match'
  }
}

export { getValidationMessages, getConfirmPasswordMessage }
