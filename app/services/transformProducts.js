export function transformProducts(variants){

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

            const sku = constructSKU(variant.variant_id, category);
            const category_code = resolveCategory(category);
            


            kaspiProducts.push(
                {
                    sku: constructSKU(variant.handle, variant.options, category),
                    product_id: variant.product_id,
                    variant_id: variant.variant_id,
                    title: variant.title,
                    brand: resolveBrand(variant.brand),
                    category: resolveCategory(category),
                    description: cleanDescription(variant.descriptionHtml),
                    attributes: mapAttributes(variant.metafields, variant.options),
                    price: variant.price,
                    stock: variant.stock, 
                    images: variant.images
                }
            ); 
        } 
    }
    return kaspiProducts;
}

function constructSKU(handle, options, category){



}

function resolveBrand(brand){
    

}

function resolveCategory(category){

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

function mapAttributes(metafields, options){


}

