import isJSONObject from './isJSONObject';

const deJSONify = (obj: any): any => {
  if (!isJSONObject(obj)) {
    throw new Error('Not a valid JSON object.');
  }

  // Convert to JSON and then parse to get rid of non-serializable properties
  const jsonString = JSON.stringify(obj);
  return JSON.parse(jsonString);
};

export default deJSONify;
