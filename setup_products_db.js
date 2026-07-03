import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1') 
    .setProject('6a462ca3002266cef903') 
    .setKey('standard_f9330e44c3b13b2e43ea40c9a768f0a1a04ca7b38f6c696fabad4a1618ea5a31063ab0674cb44e016d4a86267eb78b13133bdc27f555f02d6ca235d8b23e3d4fe9351d8327c25ab7a0c8ae3c125732e5529ac8e1213af559463f7d77bc16787d3a8d18ef90cbfacae7bb6b1efce0798f5b4d9e960de2e85142f56ab735bc2ce5');

const databases = new Databases(client);

// Replace this with the actual DATABASE_ID from your appwrite setup
const dbId = '6a46314a00119414ee28';

async function setup() {
    try {
        console.log('Creating Products collection...');
        const productsCol = await databases.createCollection(
            dbId, 
            ID.unique(), 
            'Products',
            [Permission.read(Role.any()), Permission.write(Role.any())] // Open for demo
        );
        const prodColId = productsCol.$id;
        console.log(`Products collection created with ID: ${prodColId}`);

        console.log('Creating attributes for Products...');
        // id is natively handled by $id, but if they need a custom ID string, we can add it
        await databases.createStringAttribute(dbId, prodColId, 'productId', 255, true);
        await databases.createStringAttribute(dbId, prodColId, 'name', 255, true);
        await databases.createStringAttribute(dbId, prodColId, 'price', 50, true);
        await databases.createStringAttribute(dbId, prodColId, 'size', 255, false);
        await databases.createStringAttribute(dbId, prodColId, 'image', 2048, false);
        // Using an array of strings for images
        await databases.createStringAttribute(dbId, prodColId, 'images', 2048, false, null, true);
        await databases.createStringAttribute(dbId, prodColId, 'desc', 1000, false);
        
        console.log('\n--- Setup Complete ---');
        console.log(`PRODUCTS_COLLECTION_ID: ${prodColId}`);
        
    } catch (error) {
        console.error('Error during setup:', error);
    }
}

setup();
