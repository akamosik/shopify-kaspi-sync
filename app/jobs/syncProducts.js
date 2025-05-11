import { fetchShopifyProducts } from "/app/services/fetchShopifyProducts.js";
import {transformProducts} from "/app/services/transformProducts.js"

const variants = await fetchShopifyProducts();


for (const variant of variants){
    const {title, brand} = variant;

    console.log(title + "\n" + brand + "\n\n");
}



