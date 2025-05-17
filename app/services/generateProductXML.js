import * as DBProd from "../db/dbproducts.js"
import { kaspiConfig } from "../config/apiConfig.js";
import { appPaths } from "../config/appPaths.js"

export async function generateProductXML(){
    const products = await DBProd.getAllProducts(); 

    const publishedProducts = products.filter(p=>p.delisted===false && p.uploaded_to_kaspi===true);


    const xmlContent = buildXMLContent(publishedProducts);

}

function buildXMLContent(p) {
    const header = `
                    <?xml version="1.0" encoding="UTF-8"?>
                    <kaspi_catalog date="${new Date().toISOString().split('T')[0]}" 
                    xmlns="kaspiShopping"
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                    xsi:schemaLocation="kaspiShopping http://kaspi.kz/kaspishopping.xsd">
                    <company>${kaspiConfig.company_name}</company>
                    <merchantid>${kaspiConfig.merchant_id}</merchantid>
                    <offers>      
                    `;

    const footer = `\n  </offers>\n</kaspi_catalog>`;

    const offerEntries = products.map(product => {
        return `
    <offer sku="${escapeXml(product.sku)}">
      <model>${escapeXml(product.title)}</model>
      <brand>${escapeXml(product.brand)}</brand>
      <availabilities>
        <availability available="${product.stock > 0 ? 'yes' : 'no'}" 
                     storeId="PP1" 
                     stockCount="${product.stock}"${
                        product.preorder_days > 0 ? ` preOrder="${product.preorder_days}"` : ''
                     }/>
      </availabilities>
      <price>${Math.round(product.price)}</price>
    </offer>`;
    }).join('');

    return header + offerEntries + footer;
}

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}