import fs from "fs/promises"
import path from "path"
import * as DBProd from "../db/dbproducts.js"
import { kaspiConfig } from "../config/apiConfig.js"

import {create} from "xmlbuilder2"
import { appPaths } from "../config/appPaths.js"


export async function generateProductXML(){
    const products = await DBProd.getAllProducts(); 

    const publishedProducts = products.filter(p=>p.delisted===false /* && p.uploaded_to_kaspi===true*/);

    const xmlContent = buildXMLContent(publishedProducts);

    const xmlPath = path.join(appPaths.exports, "price_list.xml");

    await fs.writeFile(xmlPath, xmlContent, "utf-8");
}



function buildXMLContent(products) {
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('kaspi_catalog', {
      date: new Date().toISOString().split('T')[0],
      xmlns: 'kaspiShopping',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'xsi:schemaLocation': 'kaspiShopping http://kaspi.kz/kaspishopping.xsd'
    });

  root
    .ele('company').txt(kaspiConfig.company_name).up()
    .ele('merchantid').txt(kaspiConfig.merchant_id).up()
    .ele('offers')
    .ele(products.map(product => ({
      offer: {
        '@sku': product.sku,
        model: product.title,
        brand: product.brand,
        availabilities: {
          availability: {
            '@available': secureStockConversion(product.sku, product.stock) > 0 ? 'yes' : 'no',
            '@storeId': 'PP1',
            '@stockCount': secureStockConversion(product.sku, product.stock)
          }
        },
        price: securePriceConversion(product.sku, product.price)
      }
    })));

  return root.end({ prettyPrint: true });
}

function securePriceConversion(sku, db_price){

    const num = Number(db_price);

    if (isNaN(num)){
        throw new Error(`Price conversion failed for sku=${sku}`);
    }

    if(!isFinite(num)){
        throw new Error(`some weird bit error happened to price at sku=${sku}`);
    }

    if(num<=0){
        throw new Error(`Price can't be 0 or less than 0. Problem at sku=${sku}`);
    }

    return Math.round(num)

}

function secureStockConversion(sku, db_stock){

    const num = Number(db_stock);

    if (isNaN(num)){
        throw new Error(`Stock conversion failed at sku = ${sku}`);
    }

    if (!isFinite(num)){
        throw new Error(`some weird bit error happened while converting stock, at sku=${sku}`)
    }

    if(num<0){
        throw new Error(`stock cannot be negative, at sku=${sku}`);
    }

    return num;

}

// function buildXMLContent(products) {
//     const header = `
// <?xml version="1.0" encoding="UTF-8"?>
// <kaspi_catalog date="${new Date().toISOString().split('T')[0]}" 
// xmlns="kaspiShopping"
// xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
// xsi:schemaLocation="kaspiShopping http://kaspi.kz/kaspishopping.xsd">
// <company>${escapeXml(kaspiConfig.company_name)}</company>
// <merchantid>${escapeXml(kaspiConfig.merchant_id)}</merchantid>
// <offers>
//                 `;

//     const footer = `\n</offers>\n</kaspi_catalog>`;

//     const offerEntries = [];

//     for (const product of products){
//         const correctPrice = securePriceConversion(product.sku, product.price);
//         const correctStock = secureStockConversion(product.sku, product.stock);

//         const offer = `
//     <offer sku="${escapeXml(product.sku)}">
//     <model>${escapeXml(product.title)}</model>
//     <brand>${escapeXml(product.brand)}</brand>
//     <availabilities>
//         <availability available="${correctStock > 0 ? 'yes' : 'no'}" 
//                     storeId="PP1" 
//                     stockCount="${correctStock}"/>
//     </availabilities>
//     <price>${correctPrice}</price>
//     </offer>
//                 `; 

//         offerEntries.push(offer)
//     }

//     const offersBody = offerEntries.join('');

//     return header + offersBody + footer;
// }

// function escapeXml(unsafe) {
//     if (!unsafe) return "";
//     return unsafe.toString()
//         .replace(/&/g, "&amp;")
//         .replace(/</g, "&lt;")
//         .replace(/>/g, "&gt;")
//         .replace(/"/g, "&quot;")
//         .replace(/'/g, "&apos;");
// }