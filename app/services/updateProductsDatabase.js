import * as DBProd from "../db/dbproducts.js"


export async function updateProductsDatabase(productList){

    const dbProducts = await DBProd.getAllProducts();

    const existing = new Map(dbProducts.map(p=>[p.sku, p]));
    const incoming = new Map(productList.map(p=>[p.sku, p]));

    for (const [sku, product] of incoming.entries()){

        const existingProduct = existing.get(sku); 

        if (!existingProduct){
            // new product, just insert
            await DBProd.insertProduct(product);
        }
        else{

            await DBProd.setField(sku, {delisted: false}); // if product was delisted before, reactivate it

            if(product.hash !== existingProduct.hash){ // update product if anything changed
                await DBProd.updateProduct(sku, product);
                await DBProd.setField(sku, {uploaded_to_kaspi: false, accepted_by_kaspi: false});
            }
        }
    }

    for (const [sku] of existing.entries()){
        if(!incoming.has(sku)){
            // existing product got deleted in shopify side, delist it so it won't appear in xml
            await DBProd.setField(sku, {delisted: true});
        }

    }
}