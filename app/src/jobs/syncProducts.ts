import { fetchShopifyProducts } from "../services/fetchShopifyProducts.js";

fetchShopifyProducts()
  .then(() => console.log("Done"))
  .catch(err => console.error("Error:", err));