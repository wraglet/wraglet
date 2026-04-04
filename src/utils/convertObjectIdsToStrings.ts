import mongoose from 'mongoose'

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v)

const convertArray = (
  value: unknown[],
  memo: WeakMap<object, unknown>,
  convert: (x: any) => any
): unknown[] => {
  const out: unknown[] = []
  memo.set(value, out)
  for (const item of value) {
    const c = convert(item)
    if (c !== undefined) out.push(c)
  }
  return out
}

const assignConvertedProperty = (
  out: Record<string, unknown>,
  key: string,
  v: unknown,
  convert: (x: any) => any
): void => {
  try {
    if (v instanceof mongoose.Types.ObjectId) {
      out[key] = v.toString()
      return
    }
    if (v instanceof Date) {
      out[key] = v.toISOString()
      return
    }
    if (Buffer.isBuffer(v)) return
    const c = convert(v)
    if (c !== undefined) out[key] = c
  } catch {
    // omit non-serializable values
  }
}

const convertPlainObject = (
  value: Record<string, unknown>,
  memo: WeakMap<object, unknown>,
  convert: (x: any) => any
): Record<string, unknown> => {
  const out: Record<string, unknown> = {}
  memo.set(value, out)
  for (const key of Object.keys(value)) {
    assignConvertedProperty(out, key, value[key], convert)
  }
  return out
}

/**
 * Serializes Mongoose docs for JSON (ObjectIds → strings, Dates → ISO).
 *
 * Uses a per-call WeakMap so the **same object reference** (e.g. one populated
 * `author` shared across many `.lean()` posts) returns the converted result again
 * instead of `null`. The previous WeakSet + `return null` on revisits stripped
 * duplicate authors from feed payloads.
 */
export const convertObjectIdsToStrings = (obj: any): any => {
  const memo = new WeakMap<object, unknown>()

  function convert(value: any): any {
    if (value === null || value === undefined) return value
    if (typeof value !== 'object') return value
    if (value instanceof Date) return value.toISOString()
    if (value instanceof mongoose.Types.ObjectId) return value.toString()
    if (Buffer.isBuffer(value)) return undefined
    if (memo.has(value)) return memo.get(value)
    if (Array.isArray(value)) return convertArray(value, memo, convert)
    if (isPlainObject(value)) return convertPlainObject(value, memo, convert)
    return value
  }

  return convert(obj)
}
