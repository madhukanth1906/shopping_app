import { Client, Databases, Users, Query } from 'node-appwrite';

const APPWRITE_PROJECT_ID = "6a462ca3002266cef903";
const APPWRITE_ENDPOINT = "https://sgp.cloud.appwrite.io/v1";
const DATABASE_ID = "6a46314a00119414ee28";
const CUSTOMERS_COLLECTION_ID = "6a46314e002a9d381971";
const ORDERS_COLLECTION_ID = "6a475366000a0609c90a";

const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const users = new Users(client);

async function purgeOrders() {
    console.log("Fetching orders to delete...");
    let keepGoing = true;
    let deletedCount = 0;

    while (keepGoing) {
        const response = await databases.listDocuments(DATABASE_ID, ORDERS_COLLECTION_ID, [
            Query.limit(100)
        ]);

        if (response.documents.length === 0) {
            keepGoing = false;
            break;
        }

        for (const doc of response.documents) {
            await databases.deleteDocument(DATABASE_ID, ORDERS_COLLECTION_ID, doc.$id);
            deletedCount++;
            console.log(`Deleted order: ${doc.$id}`);
        }
    }
    console.log(`Finished deleting ${deletedCount} orders.`);
}

async function purgeCustomers() {
    console.log("Fetching customer documents to delete...");
    let keepGoing = true;
    let deletedCount = 0;

    while (keepGoing) {
        const response = await databases.listDocuments(DATABASE_ID, CUSTOMERS_COLLECTION_ID, [
            Query.limit(100)
        ]);

        if (response.documents.length === 0) {
            keepGoing = false;
            break;
        }

        for (const doc of response.documents) {
            await databases.deleteDocument(DATABASE_ID, CUSTOMERS_COLLECTION_ID, doc.$id);
            deletedCount++;
            console.log(`Deleted customer document: ${doc.$id}`);
        }
    }
    console.log(`Finished deleting ${deletedCount} customer documents.`);
}

async function purgeAuthUsers() {
    console.log("Fetching Auth users to delete...");
    let keepGoing = true;
    let deletedCount = 0;

    while (keepGoing) {
        const response = await users.list([
            Query.limit(100)
        ]);

        if (response.users.length === 0) {
            keepGoing = false;
            break;
        }

        for (const user of response.users) {
            // Avoid deleting admin users if there are any specific emails we want to preserve
            if (user.email === 'madhu9940984501@gmail.com' || user.email === 'dharanimpdm2910@gmail.com') {
                console.log(`Skipping Admin User: ${user.email}`);
                continue;
            }
            await users.delete(user.$id);
            deletedCount++;
            console.log(`Deleted Auth user: ${user.email || user.$id}`);
        }
    }
    console.log(`Finished deleting ${deletedCount} Auth users.`);
}

async function run() {
    try {
        await purgeOrders();
        await purgeCustomers();
        await purgeAuthUsers();
        console.log("Purge completed securely.");
    } catch (err) {
        console.error("Purge Error:", err);
    }
}

run();
