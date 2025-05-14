import { getShopifyProducts } from "../api/shopify/requests.js"

export async function fetchShopifyProducts() {
    let hasNextPage = true;
    let cursorEnd = null;
    const outputVariants = [];
    
    while(hasNextPage){
        const variables = {
            first: 250, 
            after: cursorEnd
        };

        const data = await getShopifyProducts(variables);
        
        const shopifyProducts = data.products.nodes;
        
        for (const product of shopifyProducts){
            const addToKaspiFlag = product.metafields.nodes.find((item) => item.key==="toggle"); 

            if(!addToKaspiFlag || addToKaspiFlag.value!=="true"){
                continue;
            }
            
            product.variants.nodes.forEach((variant) => {
                outputVariants.push({
                  product_id: product.id, 
                  variant_id: variant.id, 
                  handle: product.handle, 
                  title: product.title,
                  vendor: product.vendor,  
                  descriptionHtml: product.descriptionHtml,
                  options: variant.selectedOptions || [],
                  metafields: product.metafields.nodes || [], 
                  price: variant.price, 
                  stock: variant.sellableOnlineQuantity ?? 0,  
                  media_nodes: product.media.nodes || []         
                });
            });
        }

        hasNextPage = data.products.pageInfo.hasNextPage;
        cursorEnd = data.products.pageInfo.cursorEnd;
    }

    return outputVariants;
}

