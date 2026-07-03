import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1') 
    .setProject('6a462ca3002266cef903') 
    .setKey('standard_f9330e44c3b13b2e43ea40c9a768f0a1a04ca7b38f6c696fabad4a1618ea5a31063ab0674cb44e016d4a86267eb78b13133bdc27f555f02d6ca235d8b23e3d4fe9351d8327c25ab7a0c8ae3c125732e5529ac8e1213af559463f7d77bc16787d3a8d18ef90cbfacae7bb6b1efce0798f5b4d9e960de2e85142f56ab735bc2ce5');

const databases = new Databases(client);

const dbId = '6a46314a00119414ee28';
const prodColId = '6a473fb5002369e03d30';

async function updateSchema() {
    try {
        console.log('Adding new attributes to Products collection...');
        
        // Add new attributes. We won't make them required so existing data doesn't break.
        await databases.createStringAttribute(dbId, prodColId, 'category', 100, false);
        await databases.createStringAttribute(dbId, prodColId, 'inventory', 5000, false);
        await databases.createStringAttribute(dbId, prodColId, 'occasion', 100, false);
        await databases.createStringAttribute(dbId, prodColId, 'color', 100, false);
        await databases.createStringAttribute(dbId, prodColId, 'fabric', 100, false);

        console.log('Attributes creation initiated. Note: Appwrite may take a few seconds to fully create them.');
        
    } catch (error) {
        console.error('Error updating schema:', error);
    }
}

updateSchema();
