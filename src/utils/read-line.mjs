import { pInt, pBool, pFloat } from "./parse-type.mjs";

const getData = (line, key) => line[key] ? String(line[key]).trim() : null;
const getIntData = (line, key) => pInt(getData(line, key) ?? 0);
const getFloatData = (line, key) => pFloat(getData(line, key) ?? 0);
const getBoolData = (line, key) => pBool(getData(line, key) ?? false);
const getLineArrData = (line, key) => line[key] ? String(line[key]).trim().split(",") : [];

export { getData, getIntData, getFloatData, getBoolData, getLineArrData };