import {updateProductMappings} from "../jobs/updateProductMappings.js"
import {fetchProductsFromShopify} from "../services/fetchProductsFromShopify.js"
import {transformProducts} from "../services/transformProducts.js"
import {updateProductsDatabase} from "../services/updateProductsDatabase.js"

//await updateProductMappings();

const shopifyVariants = await fetchProductsFromShopify();
const kaspiProducts = await transformProducts(shopifyVariants);

await updateProductsDatabase(kaspiProducts);