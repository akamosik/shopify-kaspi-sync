import {pool} from "../config/dbConfig.js"

export async function getExistingProducts(){
    const result = await pool.query('SELECT * FROM app.products');
    return result.rows;
};

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
        images
    } = product;

    const query = ``; 

}