import { Client, Account, Databases, Storage, ID, Query } from "appwrite";

export const APPWRITE_PROJECT_ID = "6a462ca3002266cef903";
export const APPWRITE_ENDPOINT = "https://sgp.cloud.appwrite.io/v1";

export const DATABASE_ID = "6a46314a00119414ee28";
export const CUSTOMERS_COLLECTION_ID = "6a46314e002a9d381971";
export const PRODUCTS_COLLECTION_ID = "6a473fb5002369e03d30";
export const ORDERS_COLLECTION_ID = "6a475366000a0609c90a";
export const REVIEWS_COLLECTION_ID = "6a47537d002614f0cd30";
export const COUPONS_COLLECTION_ID = "6a4759aa001f2ff1b886";
export const BUCKET_ID = "product-images";

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

export { client, account, databases, storage, ID, Query };
