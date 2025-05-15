import {pool} from "../config/dbConfig.js"

export async function getExistingProducts(){
    const result = await pool.query('SELECT * FROM app.products');
    return result.rows;
};