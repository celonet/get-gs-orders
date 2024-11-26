const pInt = (value) => parseInt(value ?? 0);
const pBool = (value) => String(value).trim() == 'true' ? true : false ?? false;
const pFloat = (value) => value ? parseFloat(String(value).trim()) ?? 0 : 0;

export { pInt, pBool, pFloat };