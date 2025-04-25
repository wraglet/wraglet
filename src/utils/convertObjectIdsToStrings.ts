import mongoose from 'mongoose'

export function convertObjectIdsToStrings(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertObjectIdsToStrings)
  } else if (obj instanceof Date) {
    return obj.toISOString()
  } else if (obj && typeof obj === 'object') {
    const newObj: any = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key]
        if (
          value &&
          (value instanceof mongoose.Types.ObjectId ||
            (value.buffer &&
              value.toString &&
              typeof value.toString === 'function'))
        ) {
          newObj[key] = value.toString()
        } else if (value instanceof Date) {
          newObj[key] = value.toISOString()
        } else {
          newObj[key] = convertObjectIdsToStrings(value)
        }
      }
    }
    return newObj
  }
  return obj
}
