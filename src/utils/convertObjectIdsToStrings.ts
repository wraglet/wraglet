import mongoose from 'mongoose'

export function convertObjectIdsToStrings(obj: any, seen = new WeakSet()): any {
  // Handle null and undefined
  if (obj === null || obj === undefined) {
    return obj
  }

  // Handle primitive types
  if (typeof obj !== 'object') {
    return obj
  }

  // Handle circular references
  if (seen.has(obj)) {
    return '[Circular Reference]'
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString()
  }

  // Handle ObjectId
  if (obj instanceof mongoose.Types.ObjectId) {
    return obj.toString()
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    seen.add(obj)
    return obj.map((item) => convertObjectIdsToStrings(item, seen))
  }

  // Handle objects
  if (obj && typeof obj === 'object') {
    seen.add(obj)
    const newObj: any = {}

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        try {
          const value = obj[key]

          // Handle ObjectId instances
          if (value instanceof mongoose.Types.ObjectId) {
            newObj[key] = value.toString()
          }
          // Handle Date instances
          else if (value instanceof Date) {
            newObj[key] = value.toISOString()
          }
          // Handle Buffer (which might be ObjectId)
          else if (
            value &&
            value.buffer &&
            typeof value.toString === 'function'
          ) {
            try {
              newObj[key] = value.toString()
            } catch {
              newObj[key] = '[Buffer]'
            }
          }
          // Recursively handle other objects
          else {
            newObj[key] = convertObjectIdsToStrings(value, seen)
          }
        } catch (error) {
          // If we can't process this value, skip it or provide a fallback
          newObj[key] = '[Error processing value]'
        }
      }
    }

    return newObj
  }

  return obj
}
