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
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Servicios para la colección 'tenis'
export const tenisService = {
  // Obtener todos los tenis activos
  getAll: async () => {
    try {
      const q = query(
        collection(db, 'tenis'),
        where('estado', '==', 'activo'),
        orderBy('fecha_creacion', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error obteniendo tenis:', error);
      throw error;
    }
  },

  // Obtener un tenis por ID
  getById: async (id) => {
    try {
      const docRef = doc(db, 'tenis', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo tenis por ID:', error);
      throw error;
    }
  },

  // Crear nuevo tenis (solo admin)
  create: async (tenisData) => {
    try {
      const docRef = await addDoc(collection(db, 'tenis'), {
        ...tenisData,
        fecha_creacion: serverTimestamp(),
        estado: 'activo'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creando tenis:', error);
      throw error;
    }
  },

  // Actualizar tenis (solo admin)
  update: async (id, tenisData) => {
    try {
      const docRef = doc(db, 'tenis', id);
      await updateDoc(docRef, tenisData);
    } catch (error) {
      console.error('Error actualizando tenis:', error);
      throw error;
    }
  },

  // Eliminar tenis (solo admin)
  delete: async (id) => {
    try {
      const docRef = doc(db, 'tenis', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error eliminando tenis:', error);
      throw error;
    }
  },

  // Obtener tenis por marca
  getByMarca: async (marca) => {
    try {
      const q = query(
        collection(db, 'tenis'),
        where('marca', '==', marca),
        where('estado', '==', 'activo')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error obteniendo tenis por marca:', error);
      throw error;
    }
  },

  // Obtener novedades (últimos 20)
  getNovedades: async () => {
    try {
      const q = query(
        collection(db, 'tenis'),
        where('estado', '==', 'activo'),
        orderBy('fecha_creacion', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error obteniendo novedades:', error);
      throw error;
    }
  }
};