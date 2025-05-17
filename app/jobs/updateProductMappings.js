import * as DBMap from "../db/dbmappings.js"
import {pool} from "../config/dbConfig.js"
import {getKaspiCategories, getKaspiAttributes, getKaspiAttributeValues} from "../api/kaspi/requests.js"
import { selectedCategories } from "../config/appMappings.js"

export async function updateProductMappings(){
    const client = await pool.connect();

    try{
        await client.query("BEGIN");

        await DBMap.resetProductMappings(client);

        const categories = await getKaspiCategories(selectedCategories);

        for (const cat of categories){
            await DBMap.insertCategory({
                code: cat.code, 
                title: cat.title}, client);

            const attributes = await getKaspiAttributes(cat.code);

            const attriubutesPromises = attributes.map(async (attr) =>{
                await DBMap.insertAttribute({
                    code: attr.code,
                    category_code: cat.code, 
                    type: attr.type,
                    multi_valued: attr.multiValued,
                    mandatory: attr.mandatory

                }, client);

                if (attr.type==="enum"){
                    const attribute_values = await getKaspiAttributeValues(cat.code, attr.code); 

                    const valuesPromises = attribute_values.map(async (val)=>{
                        await DBMap.insertAttributeValue({
                            attribute_code: attr.code,
                            category_code: cat.code, 
                            value_code: val.code,
                            value_name: val.name
                        }, client);
                    });

                    await Promise.all(valuesPromises);
                }

            }); 
            
            await Promise.all(attriubutesPromises);

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