import { fetchShopifyProducts } from "../services/fetchShopifyProducts.js"
import {transformProducts} from "../services/transformProducts.js"
import {appPaths} from "../config/appPaths.js"
import path from "path"
import fs from "fs"
import { updateKaspiProductMappings } from "./updateKaspiProductMappings.js"



const variants = await fetchShopifyProducts();

const kaspiProducts = await transformProducts(variants);

console.log("# of kaspi sku to be added\n")
console.log(kaspiProducts.length);

const filePath = path.join(appPaths.exports, 'kaspiProducts.json');

fs.writeFileSync(filePath, JSON.stringify(kaspiProducts, null, 2), 'utf8');
    console.log(`Kaspi products saved to ${filePath}`);