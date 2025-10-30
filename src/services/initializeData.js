import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { db } from './firebase.js';

// Datos de prueba para tenis
const sampleTenis = [
  {
    nombre: "Air Jordan 1 Retro High",
    marca: "Nike",
    descripcion: "Icónico diseño que revolucionó el baloncesto y la moda urbana",
    imagenPrincipalURL: "https://via.placeholder.com/400x300/22d3ee/ffffff?text=Air+Jordan+1",
    imagenes: [
      "https://via.placeholder.com/400x300/22d3ee/ffffff?text=Air+Jordan+1+Vista+1",
      "https://via.placeholder.com/400x300/0891b2/ffffff?text=Air+Jordan+1+Vista+2"
    ],
    categoria: "Basketball",
    genero: "Unisex",
    estado: "activo",
    fecha_creacion: new Date()
  },
  {
    nombre: "Adidas Ultraboost 22",
    marca: "Adidas",
    descripcion: "Máximo confort y rendimiento para corredores exigentes",
    imagenPrincipalURL: "https://via.placeholder.com/400x300/06b6d4/ffffff?text=Ultraboost+22",
    imagenes: [
      "https://via.placeholder.com/400x300/06b6d4/ffffff?text=Ultraboost+Vista+1",
      "https://via.placeholder.com/400x300/0e7490/ffffff?text=Ultraboost+Vista+2"
    ],
    categoria: "Running",
    genero: "Unisex",
    estado: "activo",
    fecha_creacion: new Date()
  },
  {
    nombre: "Converse Chuck Taylor All Star",
    marca: "Converse",
    descripcion: "El clásico atemporal que nunca pasa de moda",
    imagenPrincipalURL: "https://via.placeholder.com/400x300/00e5d4/ffffff?text=Chuck+Taylor",
    imagenes: [
      "https://via.placeholder.com/400x300/00e5d4/ffffff?text=Chuck+Vista+1",
      "https://via.placeholder.com/400x300/00b8a3/ffffff?text=Chuck+Vista+2"
    ],
    categoria: "Casual",
    genero: "Unisex",
    estado: "activo",
    fecha_creacion: new Date()
  }
];

// Variantes para cada tenis
const sampleVariantes = [
  // Air Jordan 1 Retro High
  { tenisId: "tenis_1", color: "Negro/Rojo", talla: "40", precio: 180000, stock: 5, sku: "AJ1-BR-40", descuento: 0, precioOriginal: 180000 },
  { tenisId: "tenis_1", color: "Negro/Rojo", talla: "41", precio: 180000, stock: 3, sku: "AJ1-BR-41", descuento: 10, precioOriginal: 200000 },
  { tenisId: "tenis_1", color: "Negro/Rojo", talla: "42", precio: 180000, stock: 8, sku: "AJ1-BR-42", descuento: 0, precioOriginal: 180000 },
  { tenisId: "tenis_1", color: "Blanco/Negro", talla: "40", precio: 185000, stock: 4, sku: "AJ1-BN-40", descuento: 0, precioOriginal: 185000 },
  { tenisId: "tenis_1", color: "Blanco/Negro", talla: "41", precio: 185000, stock: 6, sku: "AJ1-BN-41", descuento: 0, precioOriginal: 185000 },
  
  // Adidas Ultraboost 22
  { tenisId: "tenis_2", color: "Negro", talla: "40", precio: 220000, stock: 7, sku: "UB22-N-40", descuento: 15, precioOriginal: 259000 },
  { tenisId: "tenis_2", color: "Negro", talla: "41", precio: 220000, stock: 5, sku: "UB22-N-41", descuento: 15, precioOriginal: 259000 },
  { tenisId: "tenis_2", color: "Blanco", talla: "40", precio: 225000, stock: 3, sku: "UB22-B-40", descuento: 0, precioOriginal: 225000 },
  { tenisId: "tenis_2", color: "Blanco", talla: "42", precio: 225000, stock: 4, sku: "UB22-B-42", descuento: 0, precioOriginal: 225000 },
  
  // Converse Chuck Taylor
  { tenisId: "tenis_3", color: "Negro", talla: "39", precio: 95000, stock: 10, sku: "CT-N-39", descuento: 0, precioOriginal: 95000 },
  { tenisId: "tenis_3", color: "Negro", talla: "40", precio: 95000, stock: 8, sku: "CT-N-40", descuento: 0, precioOriginal: 95000 },
  { tenisId: "tenis_3", color: "Blanco", talla: "39", precio: 95000, stock: 6, sku: "CT-B-39", descuento: 20, precioOriginal: 119000 },
  { tenisId: "tenis_3", color: "Rojo", talla: "41", precio: 98000, stock: 5, sku: "CT-R-41", descuento: 0, precioOriginal: 98000 }
];

// Marcas
const sampleMarcas = [
  { nombre: "Nike", logo: "https://via.placeholder.com/100x50/22d3ee/ffffff?text=Nike", descripcion: "Just Do It", activa: true },
  { nombre: "Adidas", logo: "https://via.placeholder.com/100x50/06b6d4/ffffff?text=Adidas", descripcion: "Impossible is Nothing", activa: true },
  { nombre: "Converse", logo: "https://via.placeholder.com/100x50/00e5d4/ffffff?text=Converse", descripcion: "All Star", activa: true },
  { nombre: "Puma", logo: "https://via.placeholder.com/100x50/0891b2/ffffff?text=Puma", descripcion: "Forever Faster", activa: true },
  { nombre: "Vans", logo: "https://via.placeholder.com/100x50/0e7490/ffffff?text=Vans", descripcion: "Off The Wall", activa: true }
];

// Categorías
const sampleCategorias = [
  { nombre: "Running", descripcion: "Tenis para correr y actividades deportivas", orden: 1, activa: true },
  { nombre: "Basketball", descripcion: "Calzado especializado para baloncesto", orden: 2, activa: true },
  { nombre: "Casual", descripcion: "Tenis para uso diario y casual", orden: 3, activa: true },
  { nombre: "Skateboarding", descripcion: "Tenis diseñados para skateboarding", orden: 4, activa: true },
  { nombre: "Training", descripcion: "Calzado para entrenamiento y gym", orden: 5, activa: true }
];

// Función para inicializar datos de prueba
export const initializeTestData = async () => {
  try {
    console.log('🚀 Iniciando carga de datos de prueba...');

    // 1. Crear categorías (usando la colección correcta)
    console.log('� Creando categorías...');
    for (const categoria of sampleCategorias) {
      await addDoc(collection(db, 'categories'), {
        name: categoria.nombre,
        description: categoria.descripcion,
        order: categoria.orden,
        active: categoria.activa,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // 2. Crear productos (usando la colección correcta)
    console.log('👟 Creando productos...');
    for (let i = 0; i < sampleTenis.length; i++) {
      const tenis = sampleTenis[i];
      const productId = `product_${i + 1}`;
      
      await setDoc(doc(db, 'products', productId), {
        name: tenis.nombre,
        brand: tenis.marca,
        description: tenis.descripcion,
        mainImageUrl: tenis.imagenPrincipalURL,
        images: tenis.imagenes,
        category: tenis.categoria,
        gender: tenis.genero,
        status: tenis.estado,
        createdAt: tenis.fecha_creacion,
        updatedAt: new Date(),
        // Agregar precios por defecto
        basePrice: 99.99,
        discountPrice: null,
        inStock: true
      });
    }

    // 3. Crear configuración de la tienda
    console.log('⚙️ Creando configuración...');
    await setDoc(doc(db, 'config', 'store'), {
      storeName: 'Zapastroso',
      storeDescription: 'Tu tienda de zapatos favorita',
      currency: 'USD',
      enablePayments: false,
      enableInventory: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ ¡Datos de prueba cargados exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   • ${sampleTenis.length} productos`);
    console.log(`   • ${sampleCategorias.length} categorías`);
    console.log('   • 1 configuración de tienda');

    // Retornar estadísticas para el componente
    return {
      categoriesCreated: sampleCategorias.length,
      productsCreated: sampleTenis.length,
      variantsCreated: 0, // Por ahora no creamos variantes
      inventoryCreated: sampleTenis.length, // Un item de inventario por producto
      brandsCreated: new Set(sampleTenis.map(t => t.marca)).size // Marcas únicas
    };

  } catch (error) {
    console.error('❌ Error cargando datos de prueba:', error);
    throw error;
  }
};

// Función para verificar conexión a Firebase
export const testFirebaseConnection = async () => {
  try {
    console.log('🔍 Verificando conexión a Firebase...');
    
    // Intentar leer una colección
    const testDoc = await addDoc(collection(db, 'test'), {
      timestamp: new Date(),
      message: 'Conexión exitosa a Firebase'
    });
    
    console.log('✅ Conexión a Firebase exitosa! Doc ID:', testDoc.id);
    return true;
  } catch (error) {
    console.error('❌ Error conectando a Firebase:', error);
    return false;
  }
};