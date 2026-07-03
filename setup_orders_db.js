import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1') 
    .setProject('6a462ca3002266cef903') 
    .setKey('standard_f9330e44c3b13b2e43ea40c9a768f0a1a04ca7b38f6c696fabad4a1618ea5a31063ab0674cb44e016d4a86267eb78b13133bdc27f555f02d6ca235d8b23e3d4fe9351d8327c25ab7a0c8ae3c125732e5529ac8e1213af559463f7d77bc16787d3a8d18ef90cbfacae7bb6b1efce0798f5b4d9e960de2e85142f56ab735bc2ce5');

const databases = new Databases(client);
const dbId = '6a46314a00119414ee28';
const ordersColId = '6a475366000a0609c90a'; // From previous run

async function setup() {
    try {
        console.log('Adding remaining attributes to Orders...');
        try { await databases.createStringAttribute(dbId, ordersColId, 'status', 255, false, 'Pending'); } catch(e){}
        try { await databases.createStringAttribute(dbId, ordersColId, 'shippingAddress', 50000, true); } catch(e){}

        console.log('Creating Reviews collection...');
        const reviewsCol = await databases.createCollection(
            dbId, 
            ID.unique(), 
            'Reviews',
            [Permission.read(Role.any()), Permission.write(Role.any()), Permission.update(Role.any())]
        );
        console.log(`Reviews Collection ID: ${reviewsCol.$id}`);

        await databases.createStringAttribute(dbId, reviewsCol.$id, 'productId', 255, true);
        await databases.createStringAttribute(dbId, reviewsCol.$id, 'userName', 255, true);
        await databases.createIntegerAttribute(dbId, reviewsCol.$id, 'rating', false, 1, 5, 5); // required=false if default
        await databases.createStringAttribute(dbId, reviewsCol.$id, 'comment', 50000, true);
        await databases.createStringAttribute(dbId, reviewsCol.$id, 'reply', 50000, false);

        console.log('Setup Complete! Note these Collection IDs.');
        console.log('Orders:', ordersColId);
        console.log('Reviews:', reviewsCol.$id);

    } catch (error) {
        console.error('Error during setup:', error);
    }
}

setup();
