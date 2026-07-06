import { NextResponse } from 'next/server';
import { Client, Databases, Account, ID, Query } from 'node-appwrite';

const APPWRITE_PROJECT_ID = "6a462ca3002266cef903";
const APPWRITE_ENDPOINT = "https://sgp.cloud.appwrite.io/v1";
const DATABASE_ID = "6a46314a00119414ee28";
const PRODUCTS_COLLECTION_ID = "6a473fb5002369e03d30";
const ORDERS_COLLECTION_ID = "6a475366000a0609c90a";
const COUPONS_COLLECTION_ID = "6a4759aa001f2ff1b886";

const ADMIN_EMAILS = ['madhu9940984501@gmail.com', 'dharanimpdm2910@gmail.com'];

export async function POST(req) {
  try {
    const { action, payload, jwt } = await req.json();

    if (!jwt) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Verify User is an Admin using their JWT
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

    if (!ADMIN_EMAILS.includes(user.email)) {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
    }

    // 2. Initialize Admin SDK (Has power to bypass permissions)
    const adminClient = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);

    // 3. Perform requested action
    switch (action) {
      case 'fetchOrders':
        const ordersResponse = await databases.listDocuments(
          DATABASE_ID,
          ORDERS_COLLECTION_ID,
          [Query.orderDesc('$createdAt')]
        );
        return NextResponse.json({ success: true, data: ordersResponse.documents });

      case 'saveCoupon':
        const couponPayload = { ...payload };

        const newCoupon = await databases.createDocument(
          DATABASE_ID,
          COUPONS_COLLECTION_ID,
          ID.unique(),
          couponPayload
        );
        return NextResponse.json({ success: true, data: newCoupon });

      case 'deleteCoupon':
        await databases.deleteDocument(DATABASE_ID, COUPONS_COLLECTION_ID, payload.id);
        return NextResponse.json({ success: true });

      case 'updateOrderStatus':
        // payload: { orderId, status, updatedShippingAddress }
        const orderData = { status: payload.status };
        if (payload.updatedShippingAddress) {
          orderData.shippingAddress = JSON.stringify(payload.updatedShippingAddress);
        }
        const updatedOrder = await databases.updateDocument(
          DATABASE_ID,
          ORDERS_COLLECTION_ID,
          payload.orderId,
          orderData
        );
        return NextResponse.json({ success: true, data: updatedOrder });

      case 'saveProduct':
        // payload: { id, data }
        if (payload.id) {
          // Update
          const updated = await databases.updateDocument(DATABASE_ID, PRODUCTS_COLLECTION_ID, payload.id, payload.data);
          return NextResponse.json({ success: true, data: updated });
        } else {
          // Create
          const created = await databases.createDocument(DATABASE_ID, PRODUCTS_COLLECTION_ID, ID.unique(), payload.data);
          return NextResponse.json({ success: true, data: created });
        }

      case 'deleteProduct':
        await databases.deleteDocument(DATABASE_ID, PRODUCTS_COLLECTION_ID, payload.id);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (error) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
