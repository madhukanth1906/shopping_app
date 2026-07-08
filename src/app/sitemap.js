import { Client, Databases } from 'node-appwrite';

const APPWRITE_PROJECT_ID = "6a462ca3002266cef903";
const APPWRITE_ENDPOINT = "https://sgp.cloud.appwrite.io/v1";
const DATABASE_ID = "6a46314a00119414ee28";
const PRODUCTS_COLLECTION_ID = "6a473fb5002369e03d30";

export default async function sitemap() {
  const baseUrl = 'https://www.azhagii.me';

  const sitemapEntries = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];

  try {
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);

    if (process.env.APPWRITE_API_KEY) {
       client.setKey(process.env.APPWRITE_API_KEY);
    }
    
    const databases = new Databases(client);

    // If you ever add dynamic routes like /product/[id], you can uncomment this:
    /*
    const products = await databases.listDocuments(DATABASE_ID, PRODUCTS_COLLECTION_ID);
    products.documents.forEach((product) => {
      sitemapEntries.push({
        url: `${baseUrl}/product/${product.$id}`,
        lastModified: new Date(product.$updatedAt),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });
    */
  } catch (error) {
    console.error("Failed to generate sitemap:", error);
  }

  return sitemapEntries;
}
