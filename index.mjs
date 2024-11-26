import Yargs from "yargs/yargs";
import dotenv from "dotenv";
import fs from "fs";
import Papa from "papaparse";
import axios from "axios";
import pLimit from "p-limit";
import { parseToProduct } from "./product-parser.mjs";

dotenv.config();

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

function getConfig() {
  return {
    webapi_url: process.env.WEBAPI_URL,
    scooby_token: process.env.SCOOBY_TOKEN
  }
}

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

async function sendToWebApi(orderData) {
  const config = getConfig();

  return axios.post(`${config.webapi_url}/marketplace/v1.0/products`, JSON.stringify(orderData), {
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${config.scooby_token}`,
      'Content-Type': 'application/json',
    }
  }).then((response) => response.data)
    .catch((error) => {
      console.log(error.message)
      console.error(`Error to send ${orderData.product}: ${error.message} - ${error.response.data?.message}`);
    });
}

async function processProductFile() {
  const params = getParameters();

  try {
    const csvData = fs.readFileSync(params.csv_path).toString();

    const products = mapProducts(csvData);

    console.log(`Processing ${products.length} products`);

    console.log(JSON.stringify(products[0], null, 2));
    //const requests = orders.map((order) => webApiLimit(() => sendToWebApi(order)));

    // await Promise.all(requests)
  }
  catch (error) {
    console.error(`Error to process orders: ${error.message} - ${error}`);
  }
}

await processProductFile();

