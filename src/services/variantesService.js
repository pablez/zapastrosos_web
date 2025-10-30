import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';

// Servicios para la colección 'variantes'
export const variantesService = {
  // Obtener todas las variantes de un tenis
  getByTenisId: async (tenisId) => {
    try {
      const q = query(
        collection(db, 'variantes'),
        where('tenisId', '==', tenisId),
        orderBy('talla')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error obteniendo variantes:', error);
      throw error;
    }
  },

  // Obtener variante por ID
  getById: async (id) => {
    try {
      const docRef = doc(db, 'variantes', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo variante por ID:', error);
      throw error;
    }
  },

  // Crear nueva variante (solo admin)
  create: async (varianteData) => {
    try {
      const docRef = await addDoc(collection(db, 'variantes'), varianteData);
      return docRef.id;
    } catch (error) {
      console.error('Error creando variante:', error);
      throw error;
    }
  },

  // Actualizar variante (solo admin)
  update: async (id, varianteData) => {
    try {
      const docRef = doc(db, 'variantes', id);
      await updateDoc(docRef, varianteData);
    } catch (error) {
      console.error('Error actualizando variante:', error);
      throw error;
    }
  },

  // Eliminar variante (solo admin)
  delete: async (id) => {
    try {
      const docRef = doc(db, 'variantes', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error eliminando variante:', error);
      throw error;
    }
  },

  // Actualizar stock
  updateStock: async (id, nuevoStock) => {
    try {
      const docRef = doc(db, 'variantes', id);
      await updateDoc(docRef, { stock: nuevoStock });
    } catch (error) {
      console.error('Error actualizando stock:', error);
      throw error;
    }
  },

  // Obtener variantes con stock disponible
  getAvailableByTenisId: async (tenisId) => {
    try {
      const q = query(
        collection(db, 'variantes'),
        where('tenisId', '==', tenisId),
        where('stock', '>', 0),
        orderBy('talla')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error obteniendo variantes disponibles:', error);
      throw error;
    }
  },

  // Filtrar por precio
  getByPriceRange: async (minPrice, maxPrice) => {
    try {
      const q = query(
        collection(db, 'variantes'),
        where('precio', '>=', minPrice),
        where('precio', '<=', maxPrice),
        where('stock', '>', 0)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error filtrando por precio:', error);
      throw error;
    }
  },

  // Obtener productos en oferta
  getOnSale: async () => {
    try {
      const q = query(
        collection(db, 'variantes'),
        where('descuento', '>', 0),
        where('stock', '>', 0)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error obteniendo productos en oferta:', error);
      throw error;
    }
  }
};