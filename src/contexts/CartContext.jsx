import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

// Acciones del carrito
const cartActions = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Reducer del carrito
const cartReducer = (state, action) => {
  switch (action.type) {
    case cartActions.ADD_ITEM: {
      const { product, variant } = action.payload;
      const existingItem = state.items.find(
        item => item.tenisId === product.id && 
                item.variantId === variant.id
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.tenisId === product.id && item.variantId === variant.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }

      return {
        ...state,
        items: [...state.items, {
          tenisId: product.id,
          variantId: variant.id,
          nombre: product.nombre,
          marca: product.marca,
          color: variant.color,
          talla: variant.talla,
          precio: variant.precio,
          precioOriginal: variant.precioOriginal,
          descuento: variant.descuento,
          imagenPrincipal: product.imagenPrincipalURL,
          quantity: 1,
          stock: variant.stock
        }]
      };
    }

    case cartActions.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(
          item => !(item.tenisId === action.payload.tenisId && 
                   item.variantId === action.payload.variantId)
        )
      };

    case cartActions.UPDATE_QUANTITY:
      return {
        ...state,
        items: state.items.map(item =>
          item.tenisId === action.payload.tenisId && 
          item.variantId === action.payload.variantId
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        ).filter(item => item.quantity > 0)
      };

    case cartActions.CLEAR_CART:
      return {
        ...state,
        items: []
      };

    case cartActions.LOAD_CART:
      return {
        ...state,
        items: action.payload
      };

    default:
      return state;
  }
};

// Estado inicial
const initialState = {
  items: []
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('projectKicksCart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: cartActions.LOAD_CART, payload: cartData });
      } catch (error) {
        console.error('Error cargando carrito desde localStorage:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('projectKicksCart', JSON.stringify(state.items));
  }, [state.items]);

  // Funciones del carrito
  const addToCart = (product, variant) => {
    dispatch({ 
      type: cartActions.ADD_ITEM, 
      payload: { product, variant } 
    });
  };

  const removeFromCart = (tenisId, variantId) => {
    dispatch({ 
      type: cartActions.REMOVE_ITEM, 
      payload: { tenisId, variantId } 
    });
  };

  const updateQuantity = (tenisId, variantId, quantity) => {
    dispatch({ 
      type: cartActions.UPDATE_QUANTITY, 
      payload: { tenisId, variantId, quantity } 
    });
  };

  const clearCart = () => {
    dispatch({ type: cartActions.CLEAR_CART });
  };

  // Calcular totales
  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      const precio = item.descuento > 0 ? item.precio : item.precioOriginal || item.precio;
      return total + (precio * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};