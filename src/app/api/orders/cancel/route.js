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
