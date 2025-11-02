import fs from 'fs';
import path from 'path';

// Cargar .env local (simple parser)
function loadDotEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const raw = fs.readFileSync(envPath, 'utf8');
  const lines = raw.split(/\r?\n/);
  const out = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.substring(0, eq).trim();
    let val = trimmed.substring(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    out[key] = val;
  }
  return out;
}

async function run() {
  // Use current working directory as repo root (more reliable on Windows)
  const repoRoot = process.cwd();
  const envPath = path.join(repoRoot, '.env');
  const env = loadDotEnv(envPath);

  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID
  };

  if (!config.apiKey || !config.projectId) {
    console.error('Faltan variables de entorno de Firebase en .env. Abortando.');
    process.exit(1);
  }

  // Import firebase client SDK
  const { initializeApp } = await import('firebase/app');
  const {
    getFirestore,
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    increment
  } = await import('firebase/firestore');

  const app = initializeApp(config);
  const db = getFirestore(app);

  console.log('Buscando un pedido reciente no completado...');
  const ordersQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(10));
  const snap = await getDocs(ordersQ);
  const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const target = orders.find(o => o.status !== 'completed');
  if (!target) {
    console.log('No se encontró un pedido reciente pendiente (no completed). Revisa la colección orders.');
    process.exit(0);
  }

  // If the selected order has no items, or items lack productId, create a test order with productId
  let order = target;
  const itemsHaveProductId = order.items && order.items.length > 0 && order.items.every(it => it.productId);
  if (!order.items || order.items.length === 0 || !itemsHaveProductId) {
    console.log('El pedido seleccionado no tiene items con productId. Se creará un pedido de prueba con productId.');
    // buscar un producto disponible
    const productsSnap = await getDocs(collection(db, 'products'));
    let products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    let prod = products.find(p => (p.stock || 0) > 0) || products[0];
    if (!prod) {
      console.log('No hay productos en la colección products. Creando producto de prueba...');
      const { addDoc } = await import('firebase/firestore');
      const createdProdRef = await addDoc(collection(db, 'products'), {
        name: 'Producto prueba automático',
        price: 9.99,
        stock: 10,
        createdAt: new Date()
      });
      prod = { id: createdProdRef.id, name: 'Producto prueba automático', price: 9.99, stock: 10 };
      console.log('Producto de prueba creado:', prod.id);
    }

    const newOrder = {
      customerInfo: { fullName: 'Test User', email: 'test@example.com', phone: '000' },
      items: [{ productId: prod.id, name: prod.name || 'Producto prueba', quantity: 1, price: prod.price || 1, subtotal: prod.price || 1 }],
      payment: { total: prod.price || 1, shipping: 0, method: 'test' },
      status: 'pending',
      createdAt: new Date()
    };

    const { addDoc } = await import('firebase/firestore');
    const createdRef = await addDoc(collection(db, 'orders'), newOrder);
    console.log('Pedido de prueba creado:', createdRef.id);
    order = { id: createdRef.id, ...newOrder };
  }

  console.log('Pedido seleccionado:', order.id, 'estado actual:', order.status);
  console.log('Estructura del pedido (keys):', Object.keys(order));
  // Print a small snapshot (no fotos) to inspect where están los items
  console.log(JSON.stringify(order, (k, v) => (k === 'paymentProofs' ? '[...omitted]' : v), 2));

  console.log('Pedido seleccionado:', target.id, 'estado actual:', target.status);

  // Mostrar stock inicial de productos
  const productStates = [];
  for (const item of order.items || []) {
    if (!item.productId) continue;
    const pRef = doc(db, 'products', item.productId);
    const pSnap = await getDoc(pRef);
    const stock = pSnap.exists() ? (pSnap.data().stock || 0) : null;
    productStates.push({ productId: item.productId, name: item.name, qty: item.quantity || 0, before: stock });
  }

  console.log('Stocks antes:');
  console.table(productStates.map(p => ({ productId: p.productId, name: p.name, qty: p.qty, before: p.before })));

  // Aplicar decrementos
  for (const p of productStates) {
    if (p.before === null) {
      console.warn('Producto no encontrado, saltando:', p.productId);
      continue;
    }
    const pRef = doc(db, 'products', p.productId);
    await updateDoc(pRef, { stock: increment(-Number(p.qty)), updatedAt: new Date() });
    console.log(`Reducido stock de ${p.productId} en ${p.qty}`);
  }

  // Actualizar estado del pedido
  await updateDoc(doc(db, 'orders', target.id), { status: 'completed', updatedAt: new Date() });
  console.log('Pedido marcado como completed:', target.id);

  // Leer stocks finales
  for (const p of productStates) {
    if (p.before === null) continue;
    const pRef = doc(db, 'products', p.productId);
    const pSnap = await getDoc(pRef);
    const after = pSnap.exists() ? (pSnap.data().stock || 0) : null;
    console.log(`Producto ${p.productId}: antes=${p.before} -> después=${after}`);
  }

  console.log('Prueba completada. Revisa Firestore para confirmar documentos.');
}

run().catch(err => {
  console.error('Error en la prueba:', err);
  process.exit(1);
});
