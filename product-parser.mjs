import { pInt, pBool, pFloat } from "./parseUtils.mjs";

const getData = (line, key) => line[key] ? String(line[key]).trim() : null;
const getIntData = (line, key) => pInt(getData(line, key) ?? 0);
const getBoolData = (line, key) => pBool(getData(line, key) ?? false);
const getLineArrData = (line, key) => line[key] ? String(line[key]).trim().split(",") : [];

const getGroups = (data) => {
    let groups = [];

    const array = data.split(', ');

    for (let i = 0; i < array.length; i += 2) {
        groups.push([array[i], array[i + 1]]);
    }

    return groups;
}

const parseAttributes = (line, index) => {
    const names = getGroups(line["Request.skus.attributes.name"]);
    const values = getGroups(line["Request.skus.attributes.value"]);

    return names[index].map((name, i) => {
        return {
            name: name,
            value: values[index][i]
        }
    });
}

const parseImages = () => {
    // const links = line["Request.skus.images.link"].split(",");
    // const mains = line["Request.skus.images.main"].split(",");
    // const numbers = line["Request.skus.images.number"].split(",");

    return links[index ?? 0].map((link, i) => {
        return {
            link: link,
            main: pBool(mains[i]),
            number: pInt(numbers[i])
        }
    });
};

function parseSkus(line) {
    const actives = getLineArrData(line, "Request.skus.active");

    const skuDataId = getLineArrData(line, "Request.skus.skuData.id");
    const skuDataIntegratorId = getLineArrData(line, "Request.skus.skuData.integratorId");
    const skuDataTenant = getLineArrData(line, "Request.skus.skuData.tenant");
    const skuDataSku = getLineArrData(line, "Request.skus.skuData.sku");
    const skuDataGtin = getLineArrData(line, "Request.skus.skuData.gtin");
    const skuDataCrossdockingDays = getLineArrData(line, "Request.skus.skuData.crossdockingDays");
    const skuDataSupplierCode = getLineArrData(line, "Request.skus.skuData.supplierCode");
    const skuDataErpCode = getLineArrData(line, "Request.skus.skuData.erpCode");
    const skuDataEstablishmentCode = getLineArrData(line, "Request.skus.skuData.establishmentCode");

    const priceDataFromPrice = getLineArrData(line, "Request.skus.priceData.fromPrice");
    const priceDataPrice = getLineArrData(line, "Request.skus.priceData.price");

    const stockDataStock = getLineArrData(line, "Request.skus.stockData.stock");
    const stockDataMinStock = getLineArrData(line, "Request.skus.stockData.minStock");

    const packageDimensionDataWidth = getLineArrData(line, "Request.skus.packageDimensionData.width");
    const packageDimensionDataHeight = getLineArrData(line, "Request.skus.packageDimensionData.height");
    const packageDimensionDataDepth = getLineArrData(line, "Request.skus.packageDimensionData.depth");
    const packageDimensionDataGrossWeight = getLineArrData(line, "Request.skus.packageDimensionData.grossWeight");

    return actives.map((active, index) => {
        return {
            active: pBool(active),
            skuData: {
                id: skuDataId[index],
                integratorId: skuDataIntegratorId[index],
                tenant: skuDataTenant[index],
                sku: skuDataSku[index],
                gtin: skuDataGtin[index],
                crossdockingDays: skuDataCrossdockingDays[index],
                supplierCode: skuDataSupplierCode[index],
                erpCode: skuDataErpCode[index],
                establishmentCode: skuDataEstablishmentCode[index]
            },
            priceData: {
                fromPrice: pFloat(priceDataFromPrice[index] ?? 0),
                price: pFloat(priceDataPrice[index] ?? 0)
            },
            stockData: {
                stock: pInt(stockDataStock[index] ?? 0),
                minStock: pInt(stockDataMinStock[index] ?? 0)
            },
            packageDimensionData: {
                width: pInt(packageDimensionDataWidth ?? 0),
                height: pInt(packageDimensionDataHeight ?? 0),
                depth: pInt(packageDimensionDataDepth ?? 0),
                grossWeight: pInt(packageDimensionDataGrossWeight ?? 0)
            },
            images: [], //parseImages()
            attributes: parseAttributes(line, index),
        }
    });
}

function parseToProduct(line) {
    return {
        product: getData(line, "Request.product"),
        tenant: getData(line, "Request.tenant"),
        active: getBoolData(line, "Request.active"),
        createDate: getData(line, "Request.createDate"),
        lastUpdate: getData(line, "Request.lastUpdate"),
        customizationType: 0,
        supply: getBoolData(line, "Request.supply"),
        productData: {
            productName: getData(line, "Request.productData.productName"),
            description: getData(line, "Request.productData.description"),
            descriptionHTML: getData(line, "Request.productData.descriptionHTML"),
            brand: getData(line, "Request.productData.brand"),
            warranty: getData(line, "Request.productData.warranty"),
        },
        productDimensionData: {
            width: getIntData(line, "Request.productDimensionData.width"),
            height: getIntData(line, "Request.productDimensionData.height"),
            depth: getIntData(line, "Request.productDimensionData.depth"),
            grossWeight: getIntData(line, "Request.productDimensionData.grossWeight")
        },
        packageDimensionData: {
            width: getIntData(line, "Request.packageDimensionData.width"),
            height: getIntData(line, "Request.packageDimensionData.height"),
            depth: getIntData(line, "Request.packageDimensionData.depth"),
            grossWeight: getIntData(line, "Request.packageDimensionData.grossWeight"),
        },
        categoryData: {
            id: null,
            name: null,
        },
        categories: [],
        skus: parseSkus(line)
    }
}

export { parseToProduct };