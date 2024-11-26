import { pInt, pBool, pFloat } from "./parseUtils.mjs";

const getLineArrData = (line, key) => line[key] ? line[key].split(",") : [];

const parseAttributes = (line) => {
    const names = line["Request.skus.attributes.name"].split(",");
    const values = line["Request.skus.attributes.value"].split(",");
    return names.map((name, index) => {
        return {
            name: name,
            value: values[index]
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
            attributes: [], //parseAttributes(line)
        }
    });
}

function parseToProduct(line) {
    return {
        product: line["Request.product"],
        tenant: line["Request.tenant"],
        active: pBool(line["Request.active"] ?? false),
        createDate: line["Request.createDate"],
        lastUpdate: line["Request.lastUpdate"],
        customizationType: line["Request.customizationType"],
        supply: pBool(["Request.supply"] ?? false),
        productData: {
            productName: line["Request.productData.productName"],
            description: line["Request.productData.description"],
            descriptionHTML: line["Request.productData.descriptionHTML"],
            brand: line["Request.productData.brand"],
            warranty: line["Request.productData.warranty"]
        },
        productDimensionData: {
            width: pInt(line["Request.productDimensionData.width"] ?? 0),
            height: pInt(line["Request.productDimensionData.height"] ?? 0),
            depth: pInt(line["Request.productDimensionData.depth"] ?? 0),
            grossWeight: pInt(line["Request.productDimensionData.grossWeight"] ?? 0)
        },
        packageDimensionData: {
            width: pInt(line["Request.packageDimensionData.width"] ?? 0),
            height: pInt(line["Request.packageDimensionData.height"] ?? 0),
            depth: pInt(line["Request.packageDimensionData.depth"] ?? 0),
            grossWeight: pInt(line["Request.packageDimensionData.grossWeight"] ?? 0)
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