import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { cartService, couponService } from '../api/services';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items || [],
        coupon: action.payload.coupon || null,
        couponDiscount: action.payload.couponDiscount || 0,
        subtotal: action.payload.subtotal || 0,
        taxAmount: action.payload.taxAmount || 0,
        deliveryCharge: action.payload.deliveryCharge || 0,
        total: action.payload.total || 0,
      };

    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (i) => i.id === action.payload.id && i.spiceLevel === action.payload.spiceLevel
      );
      let updatedItems;
      if (existingIndex > -1) {
        updatedItems = state.items.map((i, idx) =>
          idx === existingIndex ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) } : i
        );
      } else {
        const cartId = `${action.payload.id}-${action.payload.spiceLevel || 'regular'}-${Date.now()}`;
        updatedItems = [...state.items, { ...action.payload, cartId, quantity: action.payload.quantity || 1 }];
      }
      return { ...state, items: updatedItems };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.cartId !== action.payload && i.id !== action.payload),
      };

    case 'UPDATE_QTY':
      if (action.payload.qty <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (i) => i.cartId !== action.payload.cartId && i.id !== action.payload.cartId
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.cartId === action.payload.cartId || i.id === action.payload.cartId
            ? { ...i, quantity: action.payload.qty }
            : i
        ),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        coupon: null,
        couponDiscount: 0,
        couponError: null,
      };

    case 'SET_COUPON':
      return {
        ...state,
        coupon: action.payload.coupon,
        couponDiscount: action.payload.discount,
        couponError: null,
      };

    case 'REMOVE_COUPON':
      return {
        ...state,
        coupon: null,
        couponDiscount: 0,
        couponError: null,
      };

    case 'SET_COUPON_ERROR':
      return { ...state, couponError: action.payload };

    default:
      return state;
  }
};

const initialState = {
  items: [],
  coupon: null,
  couponDiscount: 0,
  couponError: null,
};

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem('savoria_cart');
      return saved ? { ...init, ...JSON.parse(saved) } : init;
    } catch {
      return init;
    }
  });

  // Calculate local breakdown
  const subtotal = state.items.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
  const deliveryCharge = subtotal === 0 ? 0 : subtotal >= 999 ? 0 : 50;
  const taxAmount = Math.round(subtotal * 0.05); // 5% GST
  const discount = Number(state.couponDiscount) || 0;
  const total = Math.max(0, subtotal + deliveryCharge + taxAmount - discount);
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  // Sync state to localStorage for offline / guest resilience
  useEffect(() => {
    localStorage.setItem(
      'savoria_cart',
      JSON.stringify({
        items: state.items,
        coupon: state.coupon,
        couponDiscount: state.couponDiscount,
      })
    );
  }, [state.items, state.coupon, state.couponDiscount]);

  // Sync with backend cart when user is authenticated
  const syncFromBackend = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await cartService.getCart();
      if (res?.data?.items) {
        const backendItems = res.data.items.map((item) => ({
          cartId: item.id,
          id: item.foodItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
          customizations: item.customizations,
          subtotal: item.subtotal,
        }));
        dispatch({
          type: 'SET_CART',
          payload: {
            items: backendItems,
            couponDiscount: res.data.discountAmount || 0,
            coupon: res.data.couponCode ? { code: res.data.couponCode } : null,
          },
        });
      }
    } catch (err) {
      console.warn('Backend cart sync note:', err.message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    syncFromBackend();
  }, [syncFromBackend]);

  const addItem = async (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
    toast.success(`Added ${item.name} to cart`);

    if (isAuthenticated) {
      try {
        await cartService.addToCart({
          foodItemId: item.id,
          quantity: item.quantity || 1,
          customizations: item.spiceLevel ? { "Spice Level": item.spiceLevel } : null,
        });
      } catch (err) {
        console.warn('Backend addToCart sync note:', err.message);
      }
    }
  };

  const removeItem = async (cartId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: cartId });
    if (isAuthenticated) {
      try {
        await cartService.removeFromCart(cartId);
      } catch (err) {
        console.warn('Backend removeFromCart note:', err.message);
      }
    }
  };

  const updateQty = async (cartId, qty) => {
    dispatch({ type: 'UPDATE_QTY', payload: { cartId, qty } });
    if (isAuthenticated) {
      try {
        if (qty <= 0) {
          await cartService.removeFromCart(cartId);
        } else {
          await cartService.updateCartItem(cartId, { quantity: qty });
        }
      } catch (err) {
        console.warn('Backend updateCartItem note:', err.message);
      }
    }
  };

  const clearCart = async () => {
    dispatch({ type: 'CLEAR_CART' });
    if (isAuthenticated) {
      try {
        await cartService.clearCart();
      } catch (err) {
        console.warn('Backend clearCart note:', err.message);
      }
    }
  };

  const applyCoupon = async (code) => {
    if (!code || !code.trim()) return;
    try {
      const res = await couponService.applyCoupon(code.trim().toUpperCase(), subtotal);
      if (res?.data?.valid) {
        dispatch({
          type: 'SET_COUPON',
          payload: {
            coupon: { code: code.trim().toUpperCase() },
            discount: res.data.discountAmount || 0,
          },
        });
        toast.success(`Coupon ${code.toUpperCase()} applied!`);
      } else {
        const errorMsg = res?.data?.message || 'Invalid coupon code';
        dispatch({ type: 'SET_COUPON_ERROR', payload: errorMsg });
        toast.error(errorMsg);
      }
    } catch (err) {
      // Fallback local coupon check for common codes
      const cleanCode = code.trim().toUpperCase();
      if (cleanCode === 'SAVORIA50') {
        if (subtotal < 300) {
          dispatch({ type: 'SET_COUPON_ERROR', payload: 'Minimum order ₹300 required' });
          toast.error('Minimum order ₹300 required');
          return;
        }
        const disc = Math.min(Math.round(subtotal * 0.5), 150);
        dispatch({ type: 'SET_COUPON', payload: { coupon: { code: 'SAVORIA50' }, discount: disc } });
        toast.success('Coupon SAVORIA50 applied! Saved ₹' + disc);
      } else if (cleanCode === 'ROYAL20') {
        if (subtotal < 800) {
          dispatch({ type: 'SET_COUPON_ERROR', payload: 'Minimum order ₹800 required' });
          toast.error('Minimum order ₹800 required');
          return;
        }
        const disc = Math.min(Math.round(subtotal * 0.2), 300);
        dispatch({ type: 'SET_COUPON', payload: { coupon: { code: 'ROYAL20' }, discount: disc } });
        toast.success('Coupon ROYAL20 applied! Saved ₹' + disc);
      } else {
        const errorMsg = err.response?.data?.message || 'Invalid or expired coupon code';
        dispatch({ type: 'SET_COUPON_ERROR', payload: errorMsg });
        toast.error(errorMsg);
      }
    }
  };

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' });
    toast.success('Coupon removed');
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        subtotal,
        deliveryCharge,
        taxAmount,
        total,
        itemCount,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        applyCoupon,
        removeCoupon,
        syncFromBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
