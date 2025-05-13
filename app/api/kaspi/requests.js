import {kaspiConfig} from "../../config/apiConfig.js"

async function makeKaspiRequest(method, endpointExtension, params={}, body=null, contentType="application/json"){

    const queryString = new URLSearchParams(params).toString();
    const requestEndpoint = `${kaspiConfig.endpoint}${endpointExtension}${queryString ? `?${queryString}` : ''}`;
    
    try{

        const options = {
            method: method,
            headers: {
                "Content-Type": contentType, 
                "X-Auth-Token": kaspiConfig.token,
                "Accept": "application/json"
            }
        };

        if (body && (method==="POST")){
            options.body = JSON.stringify(body);
        }

        const response = await fetch(requestEndpoint, options);

        if (!response.ok){
            throw new Error(`HTTP error: ${response.status}`);
        }

        const result = await response.json();

        return result;
    } 
    catch(err){
        console.error("Failed to fetch from Kaspi", err.message);
        throw err;
    }
    
} 

export async function getKaspiCategories(selectedCategories = new Set()){

    const endpointExtension = "/products/classification/categories";

    const categories = await makeKaspiRequest("GET", endpointExtension);

    if (selectedCategories.size===0){
        return categories;
    }
    return categories.filter(cat => (selectedCategories.has(cat.title))); 
}

export async function getKaspiAttributes(category_code){

    const endpointExtension = "/products/classification/attributes";

    const params = {
        c: category_code
    };

    const atttibutes = await makeKaspiRequest("GET", endpointExtension, params);

    return atttibutes;

}

export async function getKaspiAttributeValues(category_code, attribute_code){

    const endpointExtension = "/products/classification/attribute/values";

    const params = {
        c: category_code,
        a: attribute_code
    };

    const attribute_values = await makeKaspiRequest("GET", endpointExtension, params);

    return attribute_values;

}