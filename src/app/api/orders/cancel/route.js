import { NextResponse } from 'next/server';
import { Client, Databases, Account } from 'node-appwrite';

const APPWRITE_PROJECT_ID = "6a462ca3002266cef903";
const APPWRITE_ENDPOINT = "https://sgp.cloud.appwrite.io/v1";
const DATABASE_ID = "6a46314a00119414ee28";
const ORDERS_COLLECTION_ID = "6a475366000a0609c90a";

export async function POST(req) {
  try {
    const { orderId, status, updatedShippingAddress, jwt } = await req.json();

    if (!jwt || !orderId) {
      return NextResponse.json({ error: "Unauthorized or missing data" }, { status: 400 });
    }

    // 1. Verify User using their JWT
    const userClient = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setJWT(jwt);
    
    const account = new Account(userClient);
    let user;
    try {
      user = await account.get();
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 2. Initialize Admin SDK
    const adminClient = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);

    // 3. Verify order belongs to this user
    const order = await databases.getDocument(DATABASE_ID, ORDERS_COLLECTION_ID, orderId);
    if (order.userId !== user.$id) {
      return NextResponse.json({ error: "Forbidden: Not your order" }, { status: 403 });
    }

    // Restore stock if the order wasn't already cancelled
    if (order.status !== 'Cancelled' && order.status !== 'Refund Requested' && (status === 'Cancelled' || status === 'Refund Requested')) {
      const PRODUCTS_COLLECTION_ID = "6a473fb5002369e03d30";
      const items = JSON.parse(order.items || '[]');
      
      for (const item of items) {
        try {
          let product;
          try {
            product = await databases.getDocument(DATABASE_ID, PRODUCTS_COLLECTION_ID, item.id);
          } catch(err) {
            // Might have used productId in older versions
            const Query = require('node-appwrite').Query;
            const fallback = await databases.listDocuments(DATABASE_ID, PRODUCTS_COLLECTION_ID, [Query.equal('productId', item.id)]);
            if (fallback.documents.length > 0) product = fallback.documents[0];
          }
          
          if (product) {
            let inventoryMap = {};
            if (Array.isArray(product.inventory)) {
              inventoryMap = product.inventory.reduce((acc, curr) => {
                const [sz, qty] = curr.split(':');
                acc[sz] = parseInt(qty);
                return acc;
              }, {});
            } else if (typeof product.inventory === 'string') {
              try { inventoryMap = JSON.parse(product.inventory); } catch(e){}
            } else if (typeof product.inventory === 'object' && product.inventory !== null) {
              inventoryMap = product.inventory;
            }

            const size = item.size || 'One Size';
            const qtyToRestore = parseInt(item.quantity) || 1;
            inventoryMap[size] = (parseInt(inventoryMap[size]) || 0) + qtyToRestore;

            await databases.updateDocument(DATABASE_ID, PRODUCTS_COLLECTION_ID, product.$id, {
              inventory: JSON.stringify(inventoryMap)
            });
          }
        } catch (err) {
          console.error("Failed to restore stock for item", item.id, err);
        }
      }
    }

    // 4. Update the order
    const orderData = { status };
    if (updatedShippingAddress) {
        orderData.shippingAddress = JSON.stringify(updatedShippingAddress);
    }
    
    const updatedOrder = await databases.updateDocument(
        DATABASE_ID,
        ORDERS_COLLECTION_ID,
        orderId,
        orderData
    );

    return NextResponse.json({ success: true, data: updatedOrder });

  } catch (error) {
    console.error("Cancel Order API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
