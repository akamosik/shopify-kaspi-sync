import * as DBProdMap from "../db/dbmapping.js"
import crypto from "crypto"
import {metafieldMapping} from "../config/appMappings.js"

// TODO: rewrite the whole thing, also change project architecture, 
// validations should happen on frontend, the backend should already get legal JSON and not handle костыли

export async function transformProducts(variants){

    const kaspiProducts = [];

    for (const variant of variants){
        try{
            const kaspiCatogoriesMetafield = variant.metafields.find((item)=>item.key==="category");

            if (!kaspiCatogoriesMetafield){
                throw new Error(`Product is missing the mandatory 'categories' metafield.`);
            }

            const categories = JSON.parse(kaspiCatogoriesMetafield.value);

            if (!Array.isArray(categories) || categories.length == 0){
                throw new Error(`Product's category metafield is invalid array or empty array.`);
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
        catch(e){
            console.warn(`(Title: ${variant.title}, Product: ${variant.product_id}, Variant: ${variant.variand_id}) - transformation failed, reason: `, e.message);
            // implement logging/notification mechanism to warn user to change filled info
        }

    }
    return kaspiProducts;
}

async function resolveCategory(category_title){

    const category = await DBProdMap.getCategoryByTitle(category_title);
    
    if(!category){
        throw new Error(`Category not found. Input = ${category_title}`);
    }

    return category.code;
}

function constructIdentifier(id, category_code){

    const uniqueIdentifier = `${id}${category_code}`.replace(/\s+/g, '');
    const hash = crypto.createHash('sha256').update(uniqueIdentifier).digest('hex');
    return hash.slice(0, 10).toUpperCase();

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
    return vendor; //fallback on default, kaspi might not reject, let's see
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
    this code is terrible and ugly, since for now i have hardcoded metafields on shopify side, instead of UI extension
    to generate always valid JSON shopify-kaspi mapping. 
    
    will completely change this in future to generalize. The mapping should be handled on frontend, and user should be bound
    to choose only legal values. There should be no manual translation on backend.
    */

    const attributes = []; 

    const allAttributesList = await DBProdMap.getAttributesByCategory(category_code);

    const attributeMap = new Map(allAttributesList.map(attr=>[attr.code, attr]));


    for (const metafield of metafields){

        if (metafield.key==="category" || metafield.key==="subcategory" || metafield.key==="toggle"){
            continue;
        }

        const attribute_code = metafieldMapping[metafield.key];

        if (!attribute_code){
            continue;
        }

        const attrInfo = attributeMap.get(attribute_code);

        if (!attrInfo){
            continue;
        }

        let value;

        if (attrInfo.type==="enum"){

            if (metafield.type==="list.single_line_text_field"){
                value = JSON.parse(metafield.value);
            }
            
            else{
                value = [metafield.value];
            }
        }

        else{
            value = metafield.value; // my case has only enum and string, no need to handle other types
        }

        attributes.push(
            {
                "code": attribute_code,
                "value": value

            }
        );
    }

    // handle special cases (no info contained in metafields, but can be inferred from other fields)
    await mapStaticAttributes(attributes, category_code, options);


    // check if all mandatory are filled

    const filledAttributeCodes = new Set(attributes.map(attr => attr.code));

    const mandatoryAttributes = new Set(
        allAttributesList.filter(attr => attr.mandatory).map(attr => attr.code)
    );

    mandatoryAttributes.forEach(mandatoryCode => {
        if (!filledAttributeCodes.has(mandatoryCode)) {
            throw new Error(`Missing mandatory attribute: ${mandatoryCode}`);
        }
    });

    return attributes;

}

async function mapStaticAttributes(attributes, category_code, options){

    // SIZE
    const sizeOption = options.find(op=>op.name==="Размер" || op.name==="Size");

    if(!sizeOption || !sizeOption.value){
        throw new Error("Product variant does not have shoe size set");
    }
    const size = sizeOption.value; 


    // GENDER
    const categoryGenders = await DBProdMap.getAttributeValues("Shoes*Gender", category_code);

    if(!categoryGenders || !categoryGenders[0] || !categoryGenders[0].value_name){
        throw new Error("Chosen category does not have specified genders");
    }

    const gender = categoryGenders[0].value_name;

    attributes.push(
       
    ); // just get whatever is default gender for category, i.e. Женские туфли -> для женщин

    // MODEL NAME
    const shoeModelLegalValues = await DBProdMap.getAttributeValues("Shoes*Model", category_code);
    const subcategoryMetafield = metafields.find(m => m.key === "subcategory");

    if (!subcategoryMetafield || !subcategoryMetafield.value){
        throw new Error("Subcategory was not selected in product metafields");
    }

    const temp = subcategoryMetafield.value;

    // string manipulation to convert "Туфли -> Лоферы" to "лоферы"

    const subcategory = temp.includes('->') ? temp.split('->')[1].trim().toLowerCase() : temp; 
    
    const matchingModel = shoeModelLegalValues.find(model => model.value_name === subcategory);

    const shoemodel = matchingModel ? matchingModel.value_name : shoeModelLegalValues[0].value_name;



    attributes.push(
        {
            "code": "Shoes*Additional information",
            "value": "Босоногая Обувь"
        },
        {
            "code": "Shoes*Shoes sole",
            "value": ["анатомическая"]
        },
        {
            "code": "Shoes*Size features",
            "value": ["маломерит на 1 размер"]
        }, 
        {
            "code": "Shoes*Size",
            "value": [size]
        },
        {
            "code": "Shoes*Manufacturer size",
            "value": size
        },
        {
            "code": "Shoes*Gender",
            "value": [gender]
        },
        {
            "code": "Shoes*Model",
            "value": [shoemodel]
        }
    );

}

