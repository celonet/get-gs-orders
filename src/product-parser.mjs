import { pInt, pBool, pFloat } from "./utils/parse-type.mjs";
import { getData, getIntData, getBoolData, getLineArrData } from "./utils/read-line.mjs";

const getAttributeGroups = (data) => {
    let groups = [];

    const array = data.split(', ');

    for (let i = 0; i < array.length; i += 2) {
        groups.push([array[i], array[i + 1]]);
    }

    return groups;
}

const getImagesNumbers = (data) => {
    let groups = [];

    const arr = data.split(', ').map((order) => parseInt(order, 10));

    let currentGroup = [arr[0]];

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] === arr[i - 1] || arr[i] === arr[i - 1] + 1) {
            currentGroup.push(arr[i]);
        } else {
            groups.push(currentGroup);
            currentGroup = [arr[i]];
        }
    }

    groups.push(currentGroup);

    return groups;
}

const parseAttributes = (line, index) => {
    const names = getAttributeGroups(line["Request.skus.attributes.name"]);
    const values = getAttributeGroups(line["Request.skus.attributes.value"]);

    return names[index].map((name, i) => {
        return {
            name: name,
            value: values[index][i]
        }
    });
}

const composeImageGroups = (line) => {
    const imageGroups = [];

    const imageOrders = getImagesNumbers(line["Request.skus.images.number"]);
    const links = line["Request.skus.images.link"].split(', ');
    const mains = line["Request.skus.images.main"].split(', ');

    imageOrders.map(groupOrder => {
        const group = [];
        groupOrder.map(e => {
            group.push({
                link: links.shift(),
                main: pBool(mains.shift()),
                number: pInt(e)
            });
        });
        imageGroups.push(group);
    });

    return imageGroups;
}

const parseSkus = (csvLine) => {
    const actives = getLineArrData(csvLine, "Request.skus.active");

    const skuDataId = getLineArrData(csvLine, "Request.skus.skuData.id");
    const skuDataIntegratorId = getLineArrData(csvLine, "Request.skus.skuData.integratorId");
    const skuDataTenant = getLineArrData(csvLine, "Request.skus.skuData.tenant");
    const skuDataSku = getLineArrData(csvLine, "Request.skus.skuData.sku");
    const skuDataGtin = getLineArrData(csvLine, "Request.skus.skuData.gtin");
    const skuDataCrossdockingDays = getLineArrData(csvLine, "Request.skus.skuData.crossdockingDays");
    const skuDataSupplierCode = getLineArrData(csvLine, "Request.skus.skuData.supplierCode");
    const skuDataErpCode = getLineArrData(csvLine, "Request.skus.skuData.erpCode");
    const skuDataEstablishmentCode = getLineArrData(csvLine, "Request.skus.skuData.establishmentCode");

    const priceDataFromPrice = getLineArrData(csvLine, "Request.skus.priceData.fromPrice");
    const priceDataPrice = getLineArrData(csvLine, "Request.skus.priceData.price");

    const stockDataStock = getLineArrData(csvLine, "Request.skus.stockData.stock");
    const stockDataMinStock = getLineArrData(csvLine, "Request.skus.stockData.minStock");

    const packageDimensionDataWidth = getLineArrData(csvLine, "Request.skus.packageDimensionData.width");
    const packageDimensionDataHeight = getLineArrData(csvLine, "Request.skus.packageDimensionData.height");
    const packageDimensionDataDepth = getLineArrData(csvLine, "Request.skus.packageDimensionData.depth");
    const packageDimensionDataGrossWeight = getLineArrData(csvLine, "Request.skus.packageDimensionData.grossWeight");

    const imageGroups = composeImageGroups(csvLine);

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
            images: imageGroups[index],
            attributes: parseAttributes(csvLine, index),
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