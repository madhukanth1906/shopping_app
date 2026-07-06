import { NextResponse } from 'next/server';
import { Client, Databases, ID, Permission, Role, Query } from 'node-appwrite';

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
      let product;
      try {
        product = await databases.getDocument(DATABASE_ID, PRODUCTS_COLLECTION_ID, item.id);
      } catch (err) {
        if (err.code === 404) {
          // Fallback for older carts that used productId instead of $id
          const fallback = await databases.listDocuments(DATABASE_ID, PRODUCTS_COLLECTION_ID, [
            Query.equal('productId', item.id)
          ]);
          if (fallback.documents.length > 0) {
            product = fallback.documents[0];
          } else {
            return NextResponse.json({ 
              error: `Item no longer exists: ${item.name}. Please remove it from your cart.` 
            }, { status: 400 });
          }
        } else {
          throw err;
        }
      }
      
      let inventoryMap = {};
      if (Array.isArray(product.inventory)) {
        inventoryMap = product.inventory.reduce((acc, curr) => {
          const [size, qty] = curr.split(':');
          acc[size] = parseInt(qty);
          return acc;
        }, {});
      } else if (typeof product.inventory === 'string') {
        try {
          inventoryMap = JSON.parse(product.inventory);
        } catch (e) {
          console.error("Failed to parse inventory JSON:", e);
        }
      } else if (typeof product.inventory === 'object' && product.inventory !== null) {
        inventoryMap = product.inventory;
      }

      const currentQty = inventoryMap[item.size] || 0;
      const orderQty = parseInt(item.quantity) || 1;

      if (currentQty < orderQty) {
        return NextResponse.json({ 
          error: `Item out of stock: ${product.name} (Size: ${item.size})` 
        }, { status: 400 });
      }

      inventoryMap[item.size] = currentQty - orderQty;

      // Convert back to JSON string for Appwrite (Attribute is string type)
      const updatedInventoryString = JSON.stringify(inventoryMap);

      productsToUpdate.push({
        id: product.$id,
        inventory: updatedInventoryString,
        originalInventory: product.inventory
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

    let newOrder;
    try {
      newOrder = await databases.createDocument(
        DATABASE_ID, 
        ORDERS_COLLECTION_ID, 
        ID.unique(), 
        orderPayload,
        [
          // Only this specific user can read their own order
          Permission.read(Role.user(userId))
        ]
      );
    } catch (orderError) {
      // Rollback inventory changes if order creation fails
      for (const p of productsToUpdate) {
        try {
          await databases.updateDocument(DATABASE_ID, PRODUCTS_COLLECTION_ID, p.id, {
            inventory: p.originalInventory
          });
        } catch (rollbackError) {
          console.error(`CRITICAL: Failed to rollback inventory for product ${p.id}`, rollbackError);
        }
      }
      throw orderError; // Bubble up to outer catch
    }

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
