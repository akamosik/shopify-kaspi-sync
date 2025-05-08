import {shopifyConfig} from "../config/api.js";

export async function makeShopifyRequest(query, variables){
    try{
        const response = await fetch(shopifyConfig.endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": shopifyConfig.token
            },
            body: JSON.stringify({
                "query": query,
                "variables": variables
            })
        });

        if (!response.ok){
            throw new Error(`HTTP error: ${response.status}`);
        }

        const result = await response.json();

        return result.data;
    } 
    catch(err){
        console.error("Failed to fetch from Shopify", err.message);
        // throw err; // throw the error upstream
    }
}