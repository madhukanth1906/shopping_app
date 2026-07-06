import { NextResponse } from 'next/server';
import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

const APPWRITE_PROJECT_ID = "6a462ca3002266cef903";
const APPWRITE_ENDPOINT = "https://sgp.cloud.appwrite.io/v1";
const DATABASE_ID = "6a46314a00119414ee28";
const PRODUCTS_COLLECTION_ID = "6a473fb5002369e03d30";
const ORDERS_COLLECTION_ID = "6a475366000a0609c90a";

export async function POST(req) {
  try {
    const { userId, cartItems, finalTotal, shippingAddress, appliedCouponId } = await req.json();

    if (!userId || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    // Initialize Admin SDK
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    // 1. Fetch current stock for all items
    const productsToUpdate = [];
    for (const item of cartItems) {
      const product = await databases.getDocument(DATABASE_ID, PRODUCTS_COLLECTION_ID, item.id);
      const inventoryArray = product.inventory || [];
      const inventoryMap = inventoryArray.reduce((acc, curr) => {
        const [size, qty] = curr.split(':');
        acc[size] = parseInt(qty);
        return acc;
      }, {});

      const currentQty = inventoryMap[item.size] || 0;
      const orderQty = parseInt(item.quantity) || 1;

      if (currentQty < orderQty) {
        return NextResponse.json({ 
          error: `Item out of stock: ${product.name} (Size: ${item.size})` 
        }, { status: 400 });
      }

      inventoryMap[item.size] = currentQty - orderQty;

      // Convert back to array of strings for Appwrite
      const updatedInventoryArray = Object.entries(inventoryMap).map(([size, qty]) => `${size}:${qty}`);

      productsToUpdate.push({
        id: product.$id,
        inventory: updatedInventoryArray
      });
    }

    // 2. Decrement stock for all items
    for (const p of productsToUpdate) {
      await databases.updateDocument(DATABASE_ID, PRODUCTS_COLLECTION_ID, p.id, {
        inventory: p.inventory
      });
    }

    // 3. Create the Order record with strict document-level permissions
    const orderPayload = {
      userId: userId,
      items: JSON.stringify(cartItems),
      total: finalTotal,
      status: 'Pending',
      shippingAddress: JSON.stringify(shippingAddress)
    };

    const newOrder = await databases.createDocument(
      DATABASE_ID, 
      ORDERS_COLLECTION_ID, 
      ID.unique(), 
      orderPayload,
      [
        // Only this specific user can read their own order
        Permission.read(Role.user(userId))
      ]
    );

    if (appliedCouponId) {
      const COUPONS_COLLECTION_ID = "6a4759aa001f2ff1b886";
      const coupon = await databases.getDocument(DATABASE_ID, COUPONS_COLLECTION_ID, appliedCouponId);
      await databases.updateDocument(DATABASE_ID, COUPONS_COLLECTION_ID, appliedCouponId, {
        usedCount: (coupon.usedCount || 0) + 1
      });
    }

    return NextResponse.json({ success: true, order: newOrder });

  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Failed to process checkout" }, { status: 500 });
  }
}
