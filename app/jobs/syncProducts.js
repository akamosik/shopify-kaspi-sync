import { fetchShopifyProducts } from "/app/services/fetchShopifyProducts.js";
import {transformProducts} from "/app/services/transformProducts.js"

const variants = await fetchShopifyProducts();
transformProducts(variants);



