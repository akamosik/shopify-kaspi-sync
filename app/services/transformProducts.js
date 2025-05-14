import * as DBProdMap from "../db/dbmapping.js"
import crypto from "crypto"
import {metafieldMapping} from "../config/appMappings.js"


export async function transformProducts(variants){

    const kaspiProducts = [];

    for (const variant of variants){

        const kaspiCatogoriesMetafield = variant.metafields.find((item)=>item.key==="category");

        if (!kaspiCatogoriesMetafield){
            console.warn(`Product ${variant.product_id} - missing the 'categories' metafield. Skipping.`); 
            continue;
        }

        const categories = JSON.parse(kaspiCatogoriesMetafield.value);

        if (!Array.isArray(categories) || categories.length == 0){
            console.warn(`Product ${variant.product_id} - category field is invalid array or empty. Skipping.`);
            continue;
        }

        for (const category_title of categories){

            const category_code = await resolveCategory(category_title);
   
            const product_id = variant.product_id.split('/').pop();
            const variant_id = variant.variant_id.split('/').pop();

            const sku = constructIdentifier(variant_id, category_code); 
            const family_id = constructIdentifier(product_id, category_code);


            const title = variant.title.replace(/\s+/g, ' ').trim();
            const brand = resolveBrand(variant.vendor);
            const description = cleanDescription(variant.descriptionHtml); 

            const attributes = await mapAttributes(category_code, variant.metafields, variant.options);

            const price = Number(variant.price);
            const stock = Number(variant.stock);

            const images = variant.media_nodes.map((item)=> ({url: item.image?.url})) || []; 

            kaspiProducts.push(
                {
                    sku,
                    product_id,
                    variant_id,
                    family_id,
                    title,
                    brand,
                    category_code,
                    description,
                    attributes,
                    price,
                    stock, 
                    images
                }
            ); 
        } 
    }
    return kaspiProducts;
}

async function resolveCategory(category_title){

    const category = await DBProdMap.getCategoryByTitle(category_title);
    
    if(!category){
        return category.code;
    }

    throw new Error(`Category not found. Input = ${category_title}`);
    
}

function constructIdentifier(id, category_code){

    const uniqueIdentifier = `${id}${category_code}`.replace(/\s+/g, '');
    const hash = crypto.createHash('sha256').update(uniqueIdentifier).digest('hex');
    const id = hash.slice(0, 10).toUpperCase();

    return id;
}

function resolveBrand(vendor){
    // manual mapping for now, because kaspi is case sensitive, and has hardcoded string values of vendors

    const map = {
        "Be Lenka":"Be lenka",
        "Barebarics":"Barebarics"
    }

    if (map.hasOwnProperty(vendor)){
        return map[vendor];
    }
    return vendor;
}



function cleanDescription(desc) {
    const text = desc
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<\/p>/g, '\n')
        .replace(/<\/li>/g, '\n')
        .replace(/<\/?[^>]+(>|$)/g, '') 
        .replace(/[^\S\r\n]+/g, ' ') 
        .replace(/\n{2,}/g, '\n') 
        .replace(/ \n/g, '\n') 
        .replace(/\n /g, '\n') 
        .trim();

    if (text.length< 1024) {return text;}

    let truncated = text.slice(0, 1024);

    const lastSentenceEnd = Math.max(
        truncated.lastIndexOf('.'),
        truncated.lastIndexOf('!'),
        truncated.lastIndexOf('?'),
        truncated.lastIndexOf('\n')
    );

    if (lastSentenceEnd > 0) {
        return truncated.slice(0, lastSentenceEnd + 1);
    }
    else {
        return truncated;
    }
}

async function mapAttributes(category_code, metafields, options){
    /* 
    the most govnokod part, since for now i have hardcoded metafields on shopify side, instead of dynamic UI extension
    to generate always valid JSON mapping from shopify data to kaspi attributes.
    */

    
    const attributes = []; 

    for (const metafield of metafields){

        if (metafield.key==="category" || metafield.key==="toggle"){
            continue;
        }

        const attribute_code = metafieldMapping[metafield.key];

        if (!attribute_code){
            continue;
        }

        const attrInfo = await DBProdMap.getAttribute(attribute_code, category_code);







        

    }



}

