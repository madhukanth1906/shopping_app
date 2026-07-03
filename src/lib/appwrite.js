import { Client, Account, Databases, Storage, ID, Query } from "appwrite";

export const APPWRITE_PROJECT_ID = "6a462ca3002266cef903";
export const APPWRITE_ENDPOINT = "https://sgp.cloud.appwrite.io/v1";

export const DATABASE_ID = "6a46314a00119414ee28";
export const CUSTOMERS_COLLECTION_ID = "6a46314e002a9d381971";
export const PRODUCTS_COLLECTION_ID = "6a473fb5002369e03d30";
export const FILES_COLLECTION_ID = "6a463156003b30aea0b4";
export const BUCKET_ID = "6a46315b00292c507910";

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

export { client, account, databases, storage, ID, Query };
