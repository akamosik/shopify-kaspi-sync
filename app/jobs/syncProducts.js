import { fetchProductsFromShopify } from "../services/fetchShopifyProducts.js";
import {transformProducts} from "../services/transformProducts.js"

const variants = await fetchProductsFromShopify();


console.log(variants);



