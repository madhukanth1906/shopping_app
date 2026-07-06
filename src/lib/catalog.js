import { databases, account, DATABASE_ID, PRODUCTS_COLLECTION_ID, REVIEWS_COLLECTION_ID, ORDERS_COLLECTION_ID, COUPONS_COLLECTION_ID, ID, Query } from "./appwrite";

async function callAdminApi(action, payload) {
    try {
        const { jwt } = await account.createJWT();
        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, payload, jwt })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Failed to ${action}`);
        return data.data;
    } catch (error) {
        console.error(`Admin API error [${action}]:`, error);
        throw error;
    }
}

export async function fetchProducts() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            PRODUCTS_COLLECTION_ID
        );
        
        const catalog = {};
        for (const doc of response.documents) {
            catalog[doc.productId] = {
                id: doc.productId,
                name: doc.name,
                price: doc.price,
                size: doc.size,
                image: doc.image,
                images: doc.images || [doc.image],
                desc: doc.desc,
                category: doc.category || 'Fashion Dress',
                inventory: doc.inventory ? JSON.parse(doc.inventory) : {},
                occasion: doc.occasion || '',
                color: doc.color || '',
                fabric: doc.fabric || '',
                createdAt: doc.$createdAt
            };
        }
        return catalog;
    } catch (error) {
        console.error('Error fetching products:', error);
        return {};
    }
}

export async function saveProduct(product) {
    try {
        // Fetch existing first to check if we are updating or creating
        const response = await databases.listDocuments(
            DATABASE_ID,
            PRODUCTS_COLLECTION_ID
        );
        const existingDoc = response.documents.find(doc => doc.productId === product.id);
        
        const payloadData = {
            productId: product.id,
            name: product.name,
            price: product.price,
            size: product.size || '',
            image: product.image,
            images: product.images,
            desc: product.desc,
            category: product.category || 'Fashion Dress',
            inventory: JSON.stringify(product.inventory || {}),
            occasion: product.occasion || '',
            color: product.color || '',
            fabric: product.fabric || ''
        };

        if (existingDoc) {
            await callAdminApi('saveProduct', { id: existingDoc.$id, data: payloadData });
        } else {
            await callAdminApi('saveProduct', { data: payloadData });
        }
        return true;
    } catch (error) {
        console.error('Error saving product:', error);
        throw error;
    }
}

export async function deleteProduct(productId) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            PRODUCTS_COLLECTION_ID
        );
        const existingDoc = response.documents.find(doc => doc.productId === productId);
        if (existingDoc) {
            await callAdminApi('deleteProduct', { id: existingDoc.$id });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

export async function fetchReviews(productId) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            REVIEWS_COLLECTION_ID,
            [Query.equal('productId', productId)]
        );
        return response.documents;
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }
}

export async function fetchCoupons() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COUPONS_COLLECTION_ID
        );
        return response.documents;
    } catch (error) {
        console.error("Error fetching coupons:", error);
        return [];
    }
}

export async function fetchAllReviews() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            REVIEWS_COLLECTION_ID
        );
        return response.documents;
    } catch (error) {
        console.error("Error fetching all reviews:", error);
        return [];
    }
}

export async function saveReview(reviewData) {
    try {
        if (reviewData.$id) {
            // Update
            return await databases.updateDocument(
                DATABASE_ID,
                REVIEWS_COLLECTION_ID,
                reviewData.$id,
                { reply: reviewData.reply }
            );
        } else {
            // Create
            return await databases.createDocument(
                DATABASE_ID,
                REVIEWS_COLLECTION_ID,
                ID.unique(),
                {
                    productId: reviewData.productId,
                    userName: reviewData.userName,
                    rating: reviewData.rating,
                    comment: reviewData.comment
                }
            );
        }
} catch (error) {
        console.error("Error saving review:", error);
        throw error;
    }
}

export async function deleteReview(reviewId) {
    try {
        return await databases.deleteDocument(
            DATABASE_ID,
            REVIEWS_COLLECTION_ID,
            reviewId
        );
    } catch (error) {
        console.error("Error deleting review:", error);
        throw error;
    }
}

export async function fetchOrders() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            ORDERS_COLLECTION_ID,
            [Query.orderDesc('$createdAt')]
        );
        return response.documents;
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
}

export async function saveOrder(orderData) {
    try {
        return await databases.createDocument(
            DATABASE_ID,
            ORDERS_COLLECTION_ID,
            ID.unique(),
            {
                userId: orderData.userId || '',
                items: orderData.items,
                total: orderData.total,
                status: orderData.status || 'Pending',
                shippingAddress: orderData.shippingAddress
            }
        );
    } catch (error) {
        console.error("Error saving order:", error);
        throw error;
    }
}

export async function fetchUserOrders(userId) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            ORDERS_COLLECTION_ID,
            [
                Query.equal('userId', userId),
                Query.orderDesc('$createdAt')
            ]
        );
        return response.documents;
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return [];
    }
}

export async function updateOrderStatus(orderId, status, updatedShippingAddress = null) {
    try {
        return await callAdminApi('updateOrderStatus', {
            orderId,
            status,
            updatedShippingAddress
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
}

export async function cancelOrder(orderId, status, updatedShippingAddress) {
    try {
        const { jwt } = await account.createJWT();
        const res = await fetch('/api/orders/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, status, updatedShippingAddress, jwt })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to cancel order');
        return data.data;
    } catch (error) {
        console.error("Error cancelling order:", error);
        throw error;
    }
}

export async function fetchCoupons() {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COUPONS_COLLECTION_ID,
            [Query.orderDesc('$createdAt')]
        );
        return response.documents;
    } catch (error) {
        console.error("Error fetching coupons:", error);
        return [];
    }
}

export async function saveCoupon(couponData) {
    try {
        return await callAdminApi('saveCoupon', {
            code: couponData.code,
            discountAmount: couponData.discountAmount,
            minPrice: couponData.minPrice,
            expiryDate: couponData.expiryDate,
            type: couponData.type || 'fixed',
            maxDiscount: couponData.maxDiscount || null
        });
    } catch (error) {
        console.error("Error saving coupon:", error);
        throw error;
    }
}

export async function deleteCoupon(couponId) {
    try {
        return await callAdminApi('deleteCoupon', { id: couponId });
    } catch (error) {
        console.error("Error deleting coupon:", error);
        throw error;
    }
}

export async function validateCoupon(code) {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COUPONS_COLLECTION_ID,
            [Query.equal('code', code)]
        );
        if (response.documents.length === 0) {
            return { valid: false, message: 'Invalid coupon code.' };
        }
        const coupon = response.documents[0];
        if (new Date(coupon.expiryDate) < new Date()) {
            return { valid: false, message: 'Coupon has expired.' };
        }
        return { valid: true, coupon };
    } catch (error) {
        console.error("Error validating coupon:", error);
        return { valid: false, message: 'Error validating coupon.' };
    }
}
