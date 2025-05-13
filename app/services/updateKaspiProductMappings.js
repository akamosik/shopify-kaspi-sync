import {resetProductMappings, batchInsertCategories, batchInsertAttributes, batchInsertAttributeValues} from "../db/productMappings.js"
import {pool} from "../config/dbConfig.js"
import {getKaspiCategories, getKaspiAttributes, getKaspiAttributeValues} from "../api/kaspi/requests.js"
import {selectedCategories} from "../config/kaspiMappings.js"

export async function updateKaspiProductMappings(){
    const client = await pool.connect();

    try{
        await client.query("BEGIN");

        await resetProductMappings(client);

        const categoriesData = [];
        const attributesData = [];
        const attributeValuesData = [];

        const categories = await getKaspiCategories(selectedCategories);

        for (const cat of categories){

            categoriesData.push({
                code: cat.code,
                title: cat.title
            });
            
            const attributes = await getKaspiAttributes(cat.code);

            for (const attr of attributes){
                attributesData.push({
                    code: attr.code,
                    category_code: cat.code, 
                    type: attr.type,
                    multi_valued: attr.multiValued,
                    mandatory: attr.mandatory
                });

                if (attr.type==="enum"){
                    const attribute_values = await getKaspiAttributeValues(cat.code, attr.code); 

                    for (const val of attribute_values){
                        attributeValuesData.push({
                            attribute_code: attr.code,
                            category_code: cat.code, 
                            value_code: val.code,
                            value_name: val.name
                        });
                    }
                }
            }
        }

        await batchInsertCategories(categoriesData, client);
        await batchInsertAttributes(attributesData, client);
        await batchInsertAttributeValues(attributeValuesData, client);

        await client.query("COMMIT");

    }
    catch(e){
        await client.query("ROLLBACK");
        throw e;

    }
    finally{
        client.release();
    }

}