import {pool} from "../config/dbConfig.js"

export async function getAllProducts(){
    const result = await pool.query('SELECT * FROM app.products');
    return result.rows;
};

export async function clearAllProducts(){
    const query = `TRUNCATE app.products CASCADE`
    await pool.query(query);
}

export async function insertProduct(product){
    const {
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
        images,
        hash
    } = product;

    const query =  `INSERT INTO app.products
                    (sku, product_id, variant_id, family_id, title, brand, category_code, 
                    description, attributes, price, stock, images, hash)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`; 
    
    const values = [
            sku, 
            product_id, 
            variant_id, 
            family_id, 
            title, 
            brand, 
            category_code, 
            description, 
            JSON.stringify(attributes), 
            price, 
            stock, 
            JSON.stringify(images), 
            hash
        ];

    await pool.query(query, values);
}

export async function updateProduct(sku, product){

    const {
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
        images,
        hash
    } = product;

    const query = `
                    UPDATE app.products
                    SET product_id=$2,
                        variant_id=$3,
                        family_id=$4,
                        title=$5,
                        brand=$6,
                        category_code=$7,
                        description=$8,
                        attributes=$9,
                        price=$10,
                        stock=$11,
                        images=$12,
                        hash=$13
                    WHERE sku=$1
                `;

    const values = [
        sku,
        product_id, 
        variant_id, 
        family_id, 
        title, 
        brand, 
        category_code, 
        description, 
        JSON.stringify(attributes), 
        price,
        stock, 
        JSON.stringify(images), 
        hash, 
    ];

    await pool.query(query, values);

}

export async function setField(sku, {uploaded_to_kaspi = null, 
                                     accepted_by_kaspi = null, 
                                     kaspi_upload_code = null, 
                                     delisted = null}){

    const queryComponents = [];
    const values = [sku];
    let placeholder_index = 2;

    if(uploaded_to_kaspi !==null){
        queryComponents.push(`uploaded_to_kaspi = $${placeholder_index}`);
        values.push(uploaded_to_kaspi);
        placeholder_index++;
    }

    if(accepted_by_kaspi!==null){
        queryComponents.push(`accepted_by_kaspi = $${placeholder_index}`);
        values.push(accepted_by_kaspi);
        placeholder_index++;
    }

    if(kaspi_upload_code !== null){
        queryComponents.push(`kaspi_upload_code = $${placeholder_index}`);
        values.push(kaspi_upload_code);
        placeholder_index++;
    }

    if(delisted !== null){
        queryComponents.push(`delisted = $${placeholder_index}`);
        values.push(delisted);
        placeholder_index++;
    }

    if (queryComponents.length > 0) {
        const params = queryComponents.join(', ');
        const query = `
            UPDATE app.products
            SET ${params}
            WHERE sku = $1
        `;

        await pool.query(query, values);
    }
}