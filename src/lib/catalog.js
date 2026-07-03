import { databases, DATABASE_ID, PRODUCTS_COLLECTION_ID, REVIEWS_COLLECTION_ID, ORDERS_COLLECTION_ID, COUPONS_COLLECTION_ID, ID, Query } from "./appwrite";

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
        // Check if product already exists
        const response = await databases.listDocuments(
            DATABASE_ID,
            PRODUCTS_COLLECTION_ID
        );
        
        const existingDoc = response.documents.find(doc => doc.productId === product.id);
        
        if (existingDoc) {
            // Update existing product
            await databases.updateDocument(
                DATABASE_ID,
                PRODUCTS_COLLECTION_ID,
                existingDoc.$id,
                {
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
                }
            );
        } else {
            // Create new product
            await databases.createDocument(
                DATABASE_ID,
                PRODUCTS_COLLECTION_ID,
                ID.unique(),
                {
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
                }
            );
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
            await databases.deleteDocument(
                DATABASE_ID,
                PRODUCTS_COLLECTION_ID,
                existingDoc.$id
            );
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

export async function updateOrderStatus(orderId, status) {
    try {
        return await databases.updateDocument(
            DATABASE_ID,
            ORDERS_COLLECTION_ID,
            orderId,
            { status }
        );
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
}

export async function cancelOrder(orderId, status, updatedShippingAddress) {
    try {
        return await databases.updateDocument(
            DATABASE_ID,
            ORDERS_COLLECTION_ID,
            orderId,
            { 
                status,
                shippingAddress: updatedShippingAddress
            }
        );
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
        return await databases.createDocument(
            DATABASE_ID,
            COUPONS_COLLECTION_ID,
            ID.unique(),
            {
                code: couponData.code,
                discountAmount: couponData.discountAmount,
                minPrice: couponData.minPrice,
                expiryDate: couponData.expiryDate
            }
        );
    } catch (error) {
        console.error("Error saving coupon:", error);
        throw error;
    }
}

export async function deleteCoupon(couponId) {
    try {
        return await databases.deleteDocument(
            DATABASE_ID,
            COUPONS_COLLECTION_ID,
            couponId
        );
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
