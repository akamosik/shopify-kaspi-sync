import { fetchShopifyProducts } from "../services/fetchShopifyProducts.js"
import {transformProducts} from "../services/transformProducts.js"
import {appPaths} from "../config/appPaths.js"
import path from "path"
import fs from "fs"


const variants = await fetchShopifyProducts();
// const kaspiProducts = await transformProducts(variants);

const example = variants[0];

const jsonString = JSON.stringify(example, null, 2);

const filePath = path.join(appPaths.exports, "example_product.json");

fs.writeFile(filePath, jsonString, (err) => {
    if (err) {
        console.error("Error writing file:", err);
    } else {
        console.log("Successfully wrote data to file:", filePath);
    }
});