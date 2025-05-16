import * as DBProd from "../db/dbproducts.js"


export async function updateProductsDatabase(productList){

    const dbProducts = await DBProd.getExistingProducts();

    const existing = new Map(dbProducts.map(p=>[p.sku, p]));
    const incoming = new Map(productList.map(p=>[p.sku, p]));

    for (const product of productList){

        if (!existing.has(product.sku)){
            // new

            await DBProd.insertOrUpdateProduct({...});

            

        }
        else{
            // check updated
            const currentProduct = existing[product.sku]; 
            const changed = detectChanges(product, currentProduct);
            if(changed){
                await DBProd.insertOrUpdateProduct({...});
            }

        }
    }

}