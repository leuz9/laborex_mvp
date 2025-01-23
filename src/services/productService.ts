import { 
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  getDocs,
  Timestamp,
  where
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Product } from '../types/product';

const COLLECTION_NAME = 'products';
const DEFAULT_PRODUCT_IMAGE = 'https://cdn3d.iconscout.com/3d/premium/thumb/product-3d-icon-download-in-png-blend-fbx-gltf-file-formats--tag-packages-box-marketing-advertisement-pack-branding-icons-4863042.png';

export const productService = {
  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const productData = {
        ...data,
        imageUrl: data.imageUrl || DEFAULT_PRODUCT_IMAGE,
        startDate: Timestamp.fromDate(data.startDate),
        endDate: data.endDate ? Timestamp.fromDate(data.endDate) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), productData);
      return { id: docRef.id, ...productData };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id: string, data: Partial<Product>) {
    try {
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };

      // Convertir les dates si elles sont présentes
      if (updateData.startDate) {
        updateData.startDate = Timestamp.fromDate(new Date(updateData.startDate));
      }
      if (updateData.endDate) {
        updateData.endDate = Timestamp.fromDate(new Date(updateData.endDate));
      }

      await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
      return { id, ...updateData };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id: string) {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  async getAllProducts() {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        imageUrl: doc.data().imageUrl || DEFAULT_PRODUCT_IMAGE
      })) as Product[];
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },

  async searchProducts(searchTerm: string) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        imageUrl: doc.data().imageUrl || DEFAULT_PRODUCT_IMAGE
      })) as Product[];
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
};