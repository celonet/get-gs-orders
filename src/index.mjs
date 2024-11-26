import Yargs from "yargs/yargs";
import fs from "fs";
import pLimit from "p-limit";
import { mapProducts } from "./csv-parser.mjs";
import { sendProductToWebApi } from "./webapi.repository.mjs";

const webApiLimit = pLimit(2);

function getParameters() {
  const args = Yargs(process.argv.slice(1)).parse()

  if (!args.csvpath) {
    throw Error(`invalid parameter "csvpath" file`)
  }

  return {
    csv_path: args.csvpath
  }
}

async function processProducts(products) {
  const logs = [];

  for (const product of products) {
    try {
      const response = await webApiLimit(() => sendProductToWebApi(product));
      logs.push(`Successfully sent product: ${product.product}: response: ${response}`);
    } catch (error) {
      logs.push(`Error to send ${product.product}: ${error.message} - ${error.response?.data?.message}`);
    }
  }

  return logs;
}

async function processProductFile() {
  const params = getParameters();

  try {
    const csvData = fs.readFileSync(params.csv_path).toString();

    const products = mapProducts(csvData);

    console.log(`Processing ${products.length} products`);

    const processLogs = await processProducts(products);

    fs.writeFileSync('logs.txt', processLogs.join('\n'));

    console.log(processLogs);
  }
  catch (error) {
    console.error(`Error to process orders: ${error.message} - ${error}`);
  }
}

await processProductFile();