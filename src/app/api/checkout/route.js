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

    // Send Order Confirmation Email via Brevo
    if (process.env.BREVO_API_KEY && shippingAddress.email) {
      try {
        let itemsHtml = `<ul>`;
        cartItems.forEach(item => {
          itemsHtml += `<li>${item.name} (Size: ${item.size}) x ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}</li>`;
        });
        itemsHtml += `</ul>`;

        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1 style="color: #7e572e; text-align: center;">Azhagii</h1>
            <h2>Order Confirmation</h2>
            <p>Hi ${shippingAddress.name || 'Customer'},</p>
            <p>Thank you for shopping with Azhagii! We have received your order.</p>
            <div style="background-color: #fbf9f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Order Summary (ID: ${newOrder.$id})</h3>
              ${itemsHtml}
              <h3 style="border-top: 1px solid #ddd; padding-top: 10px;">Total: ₹${finalTotal.toFixed(2)}</h3>
            </div>
            <h3>Shipping Details:</h3>
            <p>${shippingAddress.address}<br>${shippingAddress.city}, ${shippingAddress.postalCode}</p>
            <p>We will notify you once your order has been dispatched.</p>
            <p>Best regards,<br>The Azhagii Team</p>
          </div>
        `;

        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: 'Azhagii Orders', email: 'hello@azhagii.me' },
            to: [{ email: shippingAddress.email }],
            subject: `Order Confirmation - ${newOrder.$id}`,
            htmlContent: htmlContent
          })
        });
      } catch (emailError) {
        console.error("Failed to send order confirmation email:", emailError);
      }
    }

    return NextResponse.json({ success: true, order: newOrder });

  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Failed to process checkout" }, { status: 500 });
  }
}
