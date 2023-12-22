const isJSONObject = (obj: any): boolean => {
  try {
    JSON.stringify(obj);
    return true;
  } catch (e) {
    return false;
  }
};

export default isJSONObject;
