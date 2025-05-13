import { fetchShopifyProducts } from "../services/fetchShopifyProducts.js";
import {transformProducts} from "../services/transformProducts.js"

const variants = await fetchShopifyProducts();


console.log(variants);



