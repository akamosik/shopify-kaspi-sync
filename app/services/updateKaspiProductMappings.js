import * as DBProductMappings from "../db/productMappings.js"
import {pool} from "../config/dbConfig.js"
import {getKaspiCategories, getKaspiAttributes, getKaspiAttributeValues} from "../api/kaspi/requests.js"
import { selectedCategories } from "../config/kaspiMappings.js"

export async function updateKaspiProductMappings(){
    const client = await pool.connect();

    try{
        await client.query("BEGIN");

        await DBProductMappings.resetProductMappings(client);

        const categories = await getKaspiCategories(selectedCategories);

        for (const cat of categories){
            await DBProductMappings.insertCategory({
                code: cat.code, 
                title: cat.title}, client);

            const attributes = await getKaspiAttributes(cat.code);

            for (const attr of attributes){
                await DBProductMappings.insertAttribute({
                    code: attr.code,
                    category_code: cat.code, 
                    type: attr.type,
                    multi_valued: attr.multiValued,
                    mandatory: attr.mandatory

                }, client);

                const attribute_values = await getKaspiAttributeValues(cat.code, attr.code); 

                for (const val of attribute_values){
                    await DBProductMappings.InsertAttributeValue({
                        attribute_code: attr.code,
                        category_code: cat.code, 
                        value_code: val.code,
                        value_name: val.name
                    }, client);
                }
            }
        }

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