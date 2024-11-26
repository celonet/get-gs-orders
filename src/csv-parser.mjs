import Papa from "papaparse";
import { parseToProduct } from "./product-parser.mjs";

function mapProducts(csvData) {
    const csvObj = Papa.parse(csvData, {
        header: true,
        delimiter: ",",
        escapeChar: '"',
        newline: "\n",
        quoteChar: '"',
        skipEmptyLines: true
    });

    return csvObj.data.map((line) => parseToProduct(line));
}

export { mapProducts };