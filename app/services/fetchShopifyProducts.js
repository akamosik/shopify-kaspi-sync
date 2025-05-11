import fs from "fs";
import { makeShopifyRequest } from "/app/services/makeShopifyRequest.js";  


export async function fetchShopifyProducts() {
    let hasNextPage = true;
    let cursorEnd = null;
    const outputVariants = [];

    const query = fs.readFileSync("/app/api_queries/getProducts.gql", "utf-8");
    
    while(hasNextPage){
        const variables = {
            first: 250, 
            after: cursorEnd
        };

        const data = await makeShopifyRequest(query, variables);
        
        const shopifyProducts = data.products.nodes;
        
        for (const product of shopifyProducts){
            const addToKaspiFlag = product.metafields.nodes.find((item) => item.key==="toggle"); 

            if(!addToKaspiFlag || addToKaspiFlag.value!=="true"){
                continue;
            }
            
            product.variants.nodes.forEach((variant) => {
                outputVariants.push({
                  product_id: product.id.split('/').pop(), 
                  variant_id: variant.id.split('/').pop(), 
                  handle: product.handle, 
                  title: product.title,
                  brand: product.vendor,  
                  descriptionHtml: product.descriptionHtml,
                  options: variant.selectedOptions,
                  metafields: product.metafields.nodes || [], 
                  price: variant.price, 
                  stock: variant.sellableOnlineQuantity ?? 0,  
                  images: product.media.nodes.map((item)=> ({url: item.image?.url})) || []          
                });
            });
        }

        hasNextPage = data.products.pageInfo.hasNextPage;
        cursorEnd = data.products.pageInfo.cursorEnd;
    }

    return outputVariants;
}

