import * as DBProd from "../db/dbproducts.js"


export async function updateProductsDatabase(productList){

    const existingProducts = await DBProd.getExistingProducts();

    const existingSKUs = existingProducts.map(p=>p.sku);
    const incomingSKUs = productList.map(p=>p.sku);

    for (const product of productList){

        if (!existingSKUs.has(product.sku)){
            // new

        }
        else{
            

        }
    }

}