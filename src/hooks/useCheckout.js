import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, doc, updateDoc, getDoc, runTransaction, increment } from "firebase/firestore";
import { db } from "../services/firebase";
import { uploadPaymentProofToImageKit, checkImageKitAvailability } from "../services/imagekitService";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

export const useCheckout = () => {
  const navigate = useNavigate();
  const { items: cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();

  // Estados del formulario
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    transactionNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('qr');
  const [receiptFile, setReceiptFile] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [orderCreatedId, setOrderCreatedId] = useState(null);
  const [orderCreated, setOrderCreated] = useState(false);

  // Cálculos del carrito
  // Normalize cart items coming from CartContext (sus propiedades pueden variar)
  const cartItemsNormalized = (cartItems || []).map(item => ({
    id: item.variantId || item.tenisId || item.id,
    name: item.nombre || item.name || item.title || 'Producto',
    image: item.imagenPrincipal || item.imagenPrincipalURL || item.image || item.imagen || '',
    price: (typeof item.precio === 'number' ? item.precio : (typeof item.price === 'number' ? item.price : (item.precioOriginal || 0))),
    quantity: item.quantity || 1,
    size: item.talla || item.size || null,
    original: item.precioOriginal || item.originalPrice || null,
  }));

  // Usar el helper getCartTotal si existe, si no, calcular localmente
  const subtotal = typeof getCartTotal === 'function' ? getCartTotal() : cartItemsNormalized.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
  const shipping = 15.00;
  const total = Number(subtotal || 0) + Number(shipping || 0);

  // Verificar si el carrito está vacío al cargar
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/carrito');
    }
  }, [cartItems, navigate]);

  // Manejo de cambios en el formulario
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'El código postal es requerido';
    }

    // Validaciones específicas para pago QR
    if (selectedPaymentMethod === 'qr') {
      if (!formData.transactionNumber.trim()) {
        newErrors.transactionNumber = 'El número de transacción es requerido';
      }
      
      if (!receiptFile) {
        newErrors.receipt = 'El comprobante de pago es requerido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejo de subida de comprobante
  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          receipt: 'Por favor sube una imagen válida'
        }));
        return;
      }
      
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          receipt: 'El archivo no debe superar los 5MB'
        }));
        return;
      }
      
      setReceiptFile(file);
      setErrors(prev => ({
        ...prev,
        receipt: ''
      }));
    }
  };

  // Manejo de selección de ubicación
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  // Manejo del envío del formulario
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Normalizar la ubicación seleccionada (puede venir como { coordinates: {lat,lng}, address } o { lat,lng })
      const normalizeLocation = (loc) => {
        if (!loc) return null;
        let coords = null;
        let addr = null;
        if (loc.coordinates && (typeof loc.coordinates.lat !== 'undefined' || typeof loc.coordinates.lng !== 'undefined')) {
          coords = {
            lat: Number(loc.coordinates.lat || loc.coordinates.latitude || 0),
            lng: Number(loc.coordinates.lng || loc.coordinates.longitude || 0)
          };
          addr = loc.address || loc.addressString || null;
        } else if (typeof loc.lat !== 'undefined' && typeof loc.lng !== 'undefined') {
          coords = { lat: Number(loc.lat), lng: Number(loc.lng) };
          addr = loc.address || null;
        }
        if (!coords) return null;
        return { address: addr || formData.address || '', coordinates: coords };
      };

      const normalizedLocation = normalizeLocation(selectedLocation);

      // Crear el pedido con la estructura exacta requerida
      const orderData = {
        // Timestamp de creación
        createdAt: new Date(),
        
        // Información del cliente
        customerInfo: {
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone,
        },
        
        // Items del pedido - estructura simplificada
        items: cartItemsNormalized.map(item => ({
          id: item.id,
          image: item.image,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || "Talla única"
        })),
        
        // Información de pago
        payment: {
          method: selectedPaymentMethod,
          receiptUploaded: selectedPaymentMethod === 'qr' ? !!receiptFile : false,
          shipping: shipping,
          subtotal: subtotal,
          total: total,
          transactionNumber: selectedPaymentMethod === 'qr' ? formData.transactionNumber : null
        },
        
        // Dirección de envío con ubicación
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          location: normalizedLocation
        },
        
        // Estado del pedido
        status: 'pending',
        
        // ID del usuario (null si no está autenticado)
        userId: user?.uid || null
      };

  // Crear la orden y reducir stock de forma transaccional (subcolección variants en products/{id}/variants/{variantId})
  const newOrderRef = doc(collection(db, 'orders'));


  // Añadir objeto customer compatible con OrderLocationMap (admin espera order.customer.location.coordinates)
  const nameParts = formData.fullName.trim().split(/\s+/);
  orderData.customer = {
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    location: normalizedLocation
  };

  // Si hay un comprobante y se seleccionó pago por QR, intentar subirlo a ImageKit antes de crear la orden
  if (receiptFile && selectedPaymentMethod === 'qr') {
    // Si ImageKit está disponible, subir; si no, no abortar: guardar metadatos mínimos
    if (checkImageKitAvailability()) {
      try {
        const uploadResult = await uploadPaymentProofToImageKit(receiptFile, user?.uid || 'guest', newOrderRef.id);
        // Mapear la metadata para que PaymentProofViewer la consuma
        orderData.paymentProofs = [
          {
            fileId: uploadResult.fileId,
            url: uploadResult.url,
            fileName: uploadResult.name,
            size: uploadResult.size,
            type: uploadResult.type,
            isImage: uploadResult.isImage,
            uploadedAt: uploadResult.uploadedAt,
            uploadedBy: user?.uid || 'guest',
            service: uploadResult.service || 'imagekit'
          }
        ];
        orderData.payment = {
          ...orderData.payment,
          receiptUploaded: true
        };
      } catch (uploadErr) {
        console.error('Error subiendo comprobante a ImageKit:', uploadErr);
        // No abortar la creación de la orden; guardar metadatos locales para revisión manual
        orderData.paymentProofs = [];
        orderData.payment = {
          ...orderData.payment,
          receiptUploaded: false
        };
        orderData.pendingReceipt = {
          fileName: receiptFile.name,
          size: receiptFile.size,
          type: receiptFile.type,
          uploadedBy: user?.uid || null,
          note: 'Upload failed, needs manual processing'
        };
      }
    } else {
      // ImageKit no está configurado: no abortar, guardar metadatos mínimos para procesar manualmente
      orderData.paymentProofs = [];
      orderData.payment = {
        ...orderData.payment,
        receiptUploaded: false
      };
      orderData.pendingReceipt = {
        fileName: receiptFile.name,
        size: receiptFile.size,
        type: receiptFile.type,
        uploadedBy: user?.uid || null,
        note: 'ImageKit not configured; upload deferred'
      };
    }
  }

  try {
    await runTransaction(db, async (tx) => {
      // Para cada item, leer y decrementar stock en la variante de producto
      for (const cartItem of cartItems || []) {
        const tenisId = cartItem.tenisId || cartItem.id;
        const variantId = cartItem.variantId || cartItem.id;
        const quantity = Number(cartItem.quantity || 0);

        if (!tenisId || !variantId || quantity <= 0) continue;

        const variantRefSub = doc(db, 'products', tenisId, 'variants', variantId);
        const variantSnapSub = await tx.get(variantRefSub);

        if (variantSnapSub.exists()) {
          const current = variantSnapSub.data();
          const currentStock = Number(current.stock || 0);
          if (currentStock < quantity) {
            throw new Error(`Stock insuficiente para ${current.name || variantId}`);
          }
          // Actualizar con la nueva cantidad
          tx.update(variantRefSub, { stock: currentStock - quantity, updatedAt: new Date() });
          continue;
        }

        // Fallback a documento de producto
        const productRef = doc(db, 'products', tenisId);
        const productSnap = await tx.get(productRef);
        if (productSnap.exists()) {
          const productData = productSnap.data();
          // Si no existe campo stock, no podemos decrementar; asumimos gestión manual
          if (productData.stock === undefined) {
            // No hay stock a decrementar; continuar sin fallo
            console.debug(`Producto ${tenisId} no tiene campo 'stock', omitiendo decremento en transaction.`);
            continue;
          }
          const currentStock = Number(productData.stock || 0);
          if (currentStock < quantity) {
            throw new Error(`Stock insuficiente para ${productData.name || tenisId}`);
          }
          tx.update(productRef, { stock: currentStock - quantity, updatedAt: new Date() });
        } else {
          throw new Error(`Producto no encontrado: ${tenisId}`);
        }
      }

      // Si llegamos hasta aquí, todo el stock fue reservado/actualizado; crear la orden
      tx.set(newOrderRef, orderData);
    });

    // Transacción exitosa: limpiar carrito y establecer estado de orden creada
    clearCart();
    setOrderCreatedId(newOrderRef.id);
    setOrderCreated(true);

  } catch (txError) {
    console.error('Error realizando transacción de orden/stock:', txError);

    // Detectar errores de permisos de Firestore y dar un mensaje más claro
    const isPermError = txError && (txError.code === 'permission-denied' || /Missing or insufficient permissions/i.test(txError.message || ''));

    if (isPermError) {
      // Si no tenemos permisos para actualizar inventario desde el cliente,
      // creamos la orden en modo 'pending_inventory' para que el administrador
      // la procese y reduzca stock desde consola o Cloud Function.
      try {
        const fallbackOrder = {
          ...orderData,
          status: 'pending_inventory',
          requiresInventoryProcessing: true
        };

        const fallbackRef = await addDoc(collection(db, 'orders'), fallbackOrder);
        console.warn('Permisos insuficientes para transacción; orden creada en modo pending_inventory:', fallbackRef.id);

        // Limpiar carrito y marcar orden creada (aunque stock no fue decrementado)
        clearCart();
        setOrderCreatedId(fallbackRef.id);
        setOrderCreated(true);

        alert('Pedido registrado correctamente. El inventario será verificado por el administrador.\n\nNúmero de pedido: ' + fallbackRef.id);
      } catch (fallbackErr) {
        console.error('Error creando orden en modo fallback por permisos insuficientes:', fallbackErr);
        alert('No se pudo crear la orden debido a permisos insuficientes en Firestore. Contacta al administrador.');
      }
    } else {
      // Si la transacción falló por stock insuficiente u otro error, mostrar el mensaje original
      const msg = txError?.message || 'Error procesando el pedido.';
      alert(msg);
    }

    // No hacemos clearCart ni marcamos orderCreated en caso de error
    return;
  }
      
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      alert('Hubo un error al procesar tu pedido. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Estados
    formData,
    errors,
    isLoading,
    selectedPaymentMethod,
    receiptFile,
    selectedLocation,
    // cartItems normalizados para consumo por componentes (imagen, price, name, id, quantity)
    cartItems: cartItemsNormalized,
    subtotal,
    shipping,
    total,
    
  // Funciones
  updateFormData,
    setSelectedPaymentMethod,
    setReceiptFile,
    handleLocationSelect,
    handleReceiptUpload,
    handleSubmit,
  // Resultado de la orden
  orderCreated,
  orderCreatedId,
    
    // Navegación
    navigateToCart: () => navigate('/carrito'),
  };
};

export default useCheckout;