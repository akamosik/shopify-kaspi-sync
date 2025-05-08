import fs from "fs";
import { makeShopifyRequest } from "./makeShopifyRequest.js";  

export async function fetchShopifyProducts() {
    let hasNextPage = true;
    let cursorEnd = null;
    const productVariants = [];

    const query = fs.readFileSync("./queries/getProducts.gql", "utf-8");
    
    
    while(hasNextPage){
        const variables = {
            "first": 250, 
            "after": cursorEnd
        };

        const data = await makeShopifyRequest(query, variables);
        console.log(data);
    }
}

