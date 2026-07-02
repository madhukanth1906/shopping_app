import { Client, Databases, Storage, ID, Permission, Role } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1') 
    .setProject('6a462ca3002266cef903') 
    .setKey('standard_f9330e44c3b13b2e43ea40c9a768f0a1a04ca7b38f6c696fabad4a1618ea5a31063ab0674cb44e016d4a86267eb78b13133bdc27f555f02d6ca235d8b23e3d4fe9351d8327c25ab7a0c8ae3c125732e5529ac8e1213af559463f7d77bc16787d3a8d18ef90cbfacae7bb6b1efce0798f5b4d9e960de2e85142f56ab735bc2ce5');

const databases = new Databases(client);
const storage = new Storage(client);

// Delay utility to wait for attribute creation
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function setup() {
    try {
        console.log('Creating database...');
        const db = await databases.create(ID.unique(), 'TheAzhagiiiDB');
        const dbId = db.$id;
        console.log(`Database created with ID: ${dbId}`);

        console.log('Creating Customers collection...');
        const customersCol = await databases.createCollection(
            dbId, 
            ID.unique(), 
            'Customers',
            [Permission.read(Role.any()), Permission.write(Role.any())] // open for demo
        );
        const custColId = customersCol.$id;
        console.log(`Customers collection created with ID: ${custColId}`);

        console.log('Creating attributes for Customers...');
        await databases.createStringAttribute(dbId, custColId, 'name', 255, true);
        await databases.createEmailAttribute(dbId, custColId, 'email', true);
        await databases.createStringAttribute(dbId, custColId, 'phone', 50, false);
        await databases.createStringAttribute(dbId, custColId, 'address', 500, false);
        
        console.log('Creating Files collection (for metadata)...');
        const filesCol = await databases.createCollection(
            dbId, 
            ID.unique(), 
            'Files',
            [Permission.read(Role.any()), Permission.write(Role.any())]
        );
        const filesColId = filesCol.$id;
        console.log(`Files collection created with ID: ${filesColId}`);
        
        console.log('Creating attributes for Files...');
        await databases.createStringAttribute(dbId, filesColId, 'fileName', 255, true);
        await databases.createStringAttribute(dbId, filesColId, 'fileUrl', 2048, true);
        await databases.createStringAttribute(dbId, filesColId, 'mimeType', 50, false);
        await databases.createIntegerAttribute(dbId, filesColId, 'size', false);

        console.log('Creating Storage Bucket for files...');
        const bucket = await storage.createBucket(
            ID.unique(), 
            'AppFiles', 
            [Permission.read(Role.any()), Permission.write(Role.any())],
            false,
            false,
            undefined,
            ['jpg', 'png', 'pdf', 'mp4', 'svg', 'jpeg', 'webp']
        );
        console.log(`Storage Bucket created with ID: ${bucket.$id}`);
        
        console.log('\\n--- Setup Complete ---');
        console.log(`DATABASE_ID: ${dbId}`);
        console.log(`CUSTOMERS_COLLECTION_ID: ${custColId}`);
        console.log(`FILES_COLLECTION_ID: ${filesColId}`);
        console.log(`BUCKET_ID: ${bucket.$id}`);
        
        console.log('\\nPlease add these IDs to your environment or configuration files.');
    } catch (error) {
        console.error('Error during setup:', error);
    }
}

setup();
