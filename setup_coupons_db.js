import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1') 
    .setProject('6a462ca3002266cef903') 
    .setKey('standard_f9330e44c3b13b2e43ea40c9a768f0a1a04ca7b38f6c696fabad4a1618ea5a31063ab0674cb44e016d4a86267eb78b13133bdc27f555f02d6ca235d8b23e3d4fe9351d8327c25ab7a0c8ae3c125732e5529ac8e1213af559463f7d77bc16787d3a8d18ef90cbfacae7bb6b1efce0798f5b4d9e960de2e85142f56ab735bc2ce5'); // Admin API Key

const databases = new Databases(client);
const DATABASE_ID = '6a46314a00119414ee28';

async function setup() {
    try {
        console.log("Setting up Coupons Collection...");
        const couponsCollection = await databases.createCollection(
            DATABASE_ID,
            ID.unique(),
            'Coupons',
            [
                Permission.read(Role.any()), // Anyone can read to validate coupons
                Permission.create(Role.users()), // Assuming admins are authenticated users
                Permission.update(Role.users()),
                Permission.delete(Role.users()),
            ]
        );
        const couponsId = couponsCollection.$id;
        console.log("Coupons Collection created: ", couponsId);

        // Attributes for Coupons
        await databases.createStringAttribute(DATABASE_ID, couponsId, 'code', 50, true);
        await databases.createFloatAttribute(DATABASE_ID, couponsId, 'discountAmount', true);
        await databases.createFloatAttribute(DATABASE_ID, couponsId, 'minPrice', true);
        await databases.createDatetimeAttribute(DATABASE_ID, couponsId, 'expiryDate', true);

        console.log("Attributes created for Coupons.");
        console.log("\n--- EXPORT THESE IDs ---");
        console.log(`export const COUPONS_COLLECTION_ID = "${couponsId}";`);

    } catch (error) {
        if (error.code === 409) {
            console.log("Collection already exists or attributes already exist.");
        } else {
            console.error("Setup failed: ", error);
        }
    }
}

setup();
