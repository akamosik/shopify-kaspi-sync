import {pool} from "../config/dbConfig.js"

/* RESETTER */

export async function resetProductMappings(client=null){
    await (client || pool).query(
        `TRUNCATE mappings.categories, mappings.attributes, mappings.attribute_values CASCADE`
    );
}

/* PRODUCT CATEGORIES */

export async function insertCategory({code, title}, client=null){
    await (client || pool).query(
        `INSERT INTO mappings.categories (code, title) 
         VALUES ($1, $2)`, 
         [code, title]
    );
}

export async function getCategoryByTitle(title){
    const result = await pool.query(`SELECT * FROM mappings.categories WHERE title=$1`, [title]);
    return result.rows[0] || null;
}

export async function batchInsertCategories(categoriesData, client=null){
    if (categoriesData.length === 0) {return;}

    const values = [];

    const placeholder = categoriesData.map((_, i)=>{
        const offset = i*2; 
        values.push(categoriesData[i].code, categoriesData[i].title);
        return `($${offset+1}, $${offset+2})`;
    }).join(", ");

    const sql = `INSERT INTO mappings.categories (code, title)
                 VALUES ${placeholder}`;

    await (client||pool).query(sql, values);
}

/* PRODUCT ATTRIBUTES */

export async function insertAttribute({code, category_code, type, multi_valued, mandatory}, client=null){
    await (client || pool).query(
        `INSERT INTO mappings.attributes (code, category_code, type, multi_valued, mandatory)
         VALUES ($1, $2, $3, $4, $5)`,
        [code, category_code, type, multi_valued, mandatory]
    );
}

export async function getAttribute(attr_code, cat_code){

    const result = await pool.query(`SELECT * FROM mappings.attributes WHERE (code=$1 AND category_code=$2)`, [attr_code, cat_code]);

    return result.rows[0] || null;

}

export async function getAttributesByCategory(cat_code){

    const result = await pool.query(`SELECT * FROM mappings.attributes WHERE (category_code=$1)`, [cat_code]);

    return result.rows;
}

export async function batchInsertAttributes(attributesData, client=null){
    if (attributesData.length===0) {return;}

    const values = [];

    const placeholder = attributesData.map((_, i)=>{
        const offset = i*5;
        values.push(attributesData[i].code, 
                    attributesData[i].category_code, 
                    attributesData[i].type, 
                    attributesData[i].multi_valued, 
                    attributesData[i].mandatory
                    );
        return `($${offset+1}, $${offset+2}, $${offset+3}, $${offset+4}, $${offset+5})`;
    }).join(", ");

    const sql = `INSERT INTO mappings.attributes (code, category_code, type, multi_valued, mandatory)
                 VALUES ${placeholder}`;
            
    await (client || pool).query(sql, values);
}


/* PRODUCT ATTRIBUTE VALUES */


export async function insertAttributeValue({attribute_code, category_code, value_code, value_name}, client=null){

    await (client || pool).query(
        `INSERT INTO mappings.attribute_values (attribute_code, category_code, value_code, value_name)
         VALUES ($1, $2, $3, $4)`,
        [attribute_code, category_code, value_code, value_name]
    );

}

export async function batchInsertAttributeValues(attributeValuesData, client=null){

    if (attributeValuesData.length===0) {return;}

    const values = [];

    const placeholder = attributeValuesData.map((_, i)=>{
        const offset = i*4;
        values.push(attributeValuesData[i].attribute_code, 
                    attributeValuesData[i].category_code,
                    attributeValuesData[i].value_code,
                    attributeValuesData[i].value_name
                    );
        return `($${offset+1}, $${offset+2}, $${offset+3}, $${offset+4})`;
    }).join(", ");

    const sql = `INSERT INTO mappings.attribute_values (attribute_code, category_code, value_code, value_name)
                 VALUES ${placeholder}`;
        
    await (client || pool).query(sql, values);
}



