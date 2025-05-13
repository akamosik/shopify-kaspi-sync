import {pool} from "../config/dbConfig.js"


export async function resetProductMappings(client=null){
    await (client || pool).query(
        `TRUNCATE mappings.categories, mappings.attributes, mapping.attribute_values CASCADE`
    );
}


export async function insertCategory({code, title}, client=null){
    await (client || pool).query(
        `INSERT INTO mappings.categories (code, title) 
         VALUES ($1, $2)`, 
         [code, title]
    );
}

export async function insertAttribute({code, category_code, type, multi_valued, mandatory}, client=null){

    await (client || pool).query(
        `INSERT INTO mappings.attributes (code, category_code, type, multi_valued, mandatory)
         VALUES ($1, $2, $3, $4, $5)`,
        [code, category_code, type, multi_valued, mandatory]
    );

}

export async function InsertAttributeValue({attribute_code, category_code, value_code, value_name}, client=null){

    await (client || pool).query(
        `INSERT INTO mappings.attribute_values (attribute_code, category_code, value_code, value_name)
         VALUES ($1, $2, $3, $4)`,
        [attribute_code, category_code, value_code, value_name]
    );

}



export async function getProductCategories() {
  const res = await pool.query('SELECT * FROM mappings.categories');
  return res.rows;
}




