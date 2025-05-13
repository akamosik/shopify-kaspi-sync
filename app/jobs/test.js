import {getKaspiAttributes, getKaspiAttributeValues, getKaspiCategories} from "../api/kaspi/requests.js"
import {selectedCategories} from "../config/kaspiMappings.js"

const categories = await getKaspiCategories(selectedCategories);

console.log(categories[0].code);

const attributes = await getKaspiAttributes(categories[0].code);

console.log(attributes[0].code);

const values = await getKaspiAttributeValues(categories[0].code, attributes[0].code);

console.log(values);
