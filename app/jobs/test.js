import { fetchShopifyProducts } from "../services/fetchShopifyProducts.js"
import {transformProducts} from "../services/transformProducts.js"
import {appPaths} from "../config/appPaths.js"
import path from "path"
import fs from "fs"


const variants = await fetchShopifyProducts();
// const kaspiProducts = await transformProducts(variants);

// variants.forEach(item=>console.log(item.metafields + '\n'));

const variant = variants[0];

console.log(variant.metafields)