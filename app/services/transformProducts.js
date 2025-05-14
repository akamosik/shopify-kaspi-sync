import * as DBProdMap from "../db/dbmapping.js"
import crypto from "crypto"

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

        for (const category of categories){

            const category_code = await resolveCategory(category);

            const sku = constructSKU(variant.variant_id, category_code);    
            const product_id = variant.product_id.split('/').pop();
            const variant_id = variant.variant_id.split('/').pop();
            const title = variant.title.replace(/\s+/g, ' ').trim();
            const brand = resolveBrand(variant.vendor);
            const description = cleanDescription(variant.descriptionHtml); 

            const attributes = mapAttributes(category_code, variant.metafields, variant.options);

            const price = Number(variant.price);
            const stock = Number(variant.stock);

            const images = variant.media_nodes.map((item)=> ({url: item.image?.url})) || []; 

            kaspiProducts.push(
                {
                    sku,
                    product_id,
                    variant_id,
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

    const category_rows = await DBProdMap.getCategory({
        title: category_title
    });

    if (category_rows.length>0) {
        return category_rows[0].code;
    }
    else{
        throw new Error(`Category code is not found in the produt mapping, input = ${category_title}`); 
        //js will not raise error if array[0] does not exist, just silently return undefined
    }
    
}

function constructSKU(variant_id, category_code){

    const uniqueIdentifier = `${variant_id}${category_code}`.replace(/\s+/g, '');
    const hash = crypto.createHash('sha256').update(uniqueIdentifier).digest('hex');
    const sku = hash.slice(0, 10).toUpperCase();

    return sku;
}

function resolveBrand(brand){
    

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

function mapAttributes(category_code, metafields, options){


}

