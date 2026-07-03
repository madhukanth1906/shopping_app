import { Client, Storage, Permission, Role } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1') 
    .setProject('6a462ca3002266cef903') 
    .setKey('standard_f9330e44c3b13b2e43ea40c9a768f0a1a04ca7b38f6c696fabad4a1618ea5a31063ab0674cb44e016d4a86267eb78b13133bdc27f555f02d6ca235d8b23e3d4fe9351d8327c25ab7a0c8ae3c125732e5529ac8e1213af559463f7d77bc16787d3a8d18ef90cbfacae7bb6b1efce0798f5b4d9e960de2e85142f56ab735bc2ce5');

const storage = new Storage(client);

async function setupStorage() {
    try {
        const bucketId = 'product-images';
        console.log(`Creating storage bucket with ID: ${bucketId}...`);
        
        const bucket = await storage.createBucket(
            bucketId,
            'Product Images',
            [Permission.read(Role.any()), Permission.write(Role.any()), Permission.update(Role.any()), Permission.delete(Role.any())],
            false,
            true, // Enable anti-virus
            undefined, // No max file size
            ['jpg', 'jpeg', 'png', 'gif', 'webp'] // Allowed extensions
        );

        console.log('Bucket created successfully!');
        console.log(bucket);
    } catch (error) {
        console.error('Error creating bucket:', error);
    }
}

setupStorage();
