import Yargs from "yargs/yargs";
import dotenv from "dotenv";
import fs from "fs";
import Papa from "papaparse";
import axios from "axios";
import pLimit from "p-limit";

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

function parseLine(line) {
  const pInt = (value) => parseInt(value ?? 0);
  const pBool = (value) => Boolean(value ?? false);
  const pFloat = (value) => parseFloat(value) ?? 0;

  const parseImages = () => {
    const links = line["Request.skus.images.link"].split(",");
    const mains = line["Request.skus.images.main"].split(",");
    const numbers = line["Request.skus.images.number"].split(",");

    return links.map((link, index) => {
      return {
        link: link,
        main: pBool(mains[index]),
        number: pInt(numbers[index])
      }
    });
  }

  const parseAttribute = () => {
    const names = line["Request.skus.attributes.name"].split(",");
    const values = line["Request.skus.attributes.value"].split(",");
    return names.map((name, index) => {
      return {
        name: name,
        value: values[index]
      }
    });
  }

  return {
    product: line["Request.product"],
    tenant: line["Request.tenant"],
    active: pBool(line["Request.active"]),
    createDate: line["Request.createDate"],
    lastUpdate: line["Request.lastUpdate"],
    customizationType: line["Request.customizationType"],
    supply: pBool["Request.supply"],
    productData: {
      productName: line["Request.productData.productName"],
      description: line["Request.productData.description"],
      descriptionHTML: line["Request.productData.descriptionHTML"],
      brand: line["Request.productData.brand"],
      warranty: line["Request.productData.warranty"]
    },
    productDimensionData: {
      width: pInt(line["Request.productDimensionData.width"]),
      height: pInt(line["Request.productDimensionData.height"]),
      depth: pInt(line["Request.productDimensionData.depth"]),
      grossWeight: pInt(line["Request.productDimensionData.grossWeight"])
    },
    packageDimensionData: {
      width: pInt(line["Request.packageDimensionData.width"]),
      height: pInt(line["Request.packageDimensionData.height"]),
      depth: pInt(line["Request.packageDimensionData.depth"]),
      grossWeight: pInt(line["Request.packageDimensionData.grossWeight"])
    },
    categoryData: {
      id: line["Request.categoryData.id"],
      name: line["Request.categoryData.name"]
    },
    categories: [],
    skus: [
      {
        active: line["Request.skus.active"],
        skuData: {
          id: line["Request.skus.skuData.id"],
          integratorId: line["Request.skus.skuData.integratorId"],
          tenant: line["Request.skus.skuData.tenant"],
          sku: line["Request.skus.skuData.sku"],
          gtin: line["Request.skus.skuData.gtin"],
          crossdockingDays: line["Request.skus.skuData.crossdockingDays"],
          supplierCode: line["Request.skus.skuData.supplierCode"],
          erpCode: line["Request.skus.skuData.erpCode"],
          establishmentCode: line["Request.skus.skuData.establishmentCode"]
        },
        priceData: {
          fromPrice: pFloat(line["Request.skus.priceData.fromPrice"]),
          price: pFloat(line["Request.skus.priceData.price"])
        },
        stockData: {
          stock: pInt(line["Request.skus.stockData.stock"]),
          minStock: pInt(line["Request.skus.stockData.minStock"])
        },
        packageDimensionData: {
          width: pInt(line["Request.skus.packageDimensionData.width"] ?? 0),
          height: pInt(line["Request.skus.packageDimensionData.height"] ?? 0),
          depth: pInt(line["Request.skus.packageDimensionData.depth"] ?? 0),
          grossWeight: pInt(line["Request.skus.packageDimensionData.grossWeight"] ?? 0)
        },
        images: parseImages(),
        attributes: parseAttribute()
      }
    ]
  }
}

function mapOrders(csvData) {

  const csvObj = Papa.parse(csvData, {
    header: true,
    delimiter: ",",
    escapeChar: '"',
    newline: "\n",
    quoteChar: '"',
    skipEmptyLines: true
  });

  return csvObj.data.map((line) => parseLine(line));
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
      console.error(`Error to send ${orderData.product}: ${error.message} - ${error.response.data.message}`);
    });
}

async function processOrders() {
  const params = getParameters();

  try {
    const csvData = fs.readFileSync(params.csv_path).toString();

    const orders = mapOrders(csvData);

    console.log(`Processing ${orders.length} orders`);

    const requests = orders.map((order) => webApiLimit(() => sendToWebApi(order)));

    await Promise.all(requests)
  }
  catch (error) {
    console.error(`Error to process orders: ${error.message} - ${error}`);
  }
}

await processOrders();

