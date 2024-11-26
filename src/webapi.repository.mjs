import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

function getConfig() {
    return {
        webapi_url: process.env.WEBAPI_URL,
        scooby_token: process.env.SCOOBY_TOKEN
    }
}

async function sendProductToWebApi(product) {
    const config = getConfig();

    const url = `${config.webapi_url}/marketplace/v1.0/products`;
    const payload = JSON.stringify(product)

    const request = await axios.post(url, payload, {
        headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${config.scooby_token}`,
            'Content-Type': 'application/json',
        }
    });

    return request.data;
}

export { sendProductToWebApi };