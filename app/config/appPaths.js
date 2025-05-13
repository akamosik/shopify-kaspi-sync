import path from "path"
import {fileURLToPath} from "url"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appRoot = path.resolve(__dirname, "..");

export const appPaths = {
    appRoot: appRoot, 
    shopifyQueries: path.join(appRoot, "api", "shopify", "queries"),
    exports: path.join(appRoot, "exports")  
}


