import { databases, DATABASE_ID, PRODUCTS_COLLECTION_ID, ID } from './appwrite.js';

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
                desc: doc.desc
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
                    size: product.size,
                    image: product.image,
                    images: product.images,
                    desc: product.desc
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
                    size: product.size,
                    image: product.image,
                    images: product.images,
                    desc: product.desc
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
