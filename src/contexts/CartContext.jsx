import { createContext, useContext, useReducer, useEffect } from 'react';
import { COUPONS, TAX_RATE, DELIVERY_CHARGE, FREE_DELIVERY_ABOVE } from '../data/data';

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.cartId === action.payload.cartId);
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.cartId === action.payload.cartId
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.cartId !== action.payload) };
    case 'UPDATE_QTY':
      if (action.payload.qty <= 0) {
        return { ...state, items: state.items.filter(i => i.cartId !== action.payload.cartId) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.cartId === action.payload.cartId ? { ...i, quantity: action.payload.qty } : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, items: [], coupon: null, couponDiscount: 0 };
    case 'APPLY_COUPON': {
      const coupon = COUPONS.find(c => c.code === action.payload.toUpperCase());
      if (!coupon) return { ...state, couponError: 'Invalid coupon code' };
      const subtotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
      if (subtotal < coupon.minOrder) {
        return { ...state, couponError: `Minimum order ₹${coupon.minOrder} required` };
      }
      let discount = coupon.type === 'percent'
        ? Math.round(subtotal * coupon.discount / 100)
        : coupon.discount;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      return { ...state, coupon, couponDiscount: discount, couponError: null };
    }
    case 'REMOVE_COUPON':
      return { ...state, coupon: null, couponDiscount: 0, couponError: null };
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
  const [state, dispatch] = useReducer(cartReducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem('savoria_cart');
      return saved ? { ...init, ...JSON.parse(saved) } : init;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    localStorage.setItem('savoria_cart', JSON.stringify({
      items: state.items,
      coupon: state.coupon,
      couponDiscount: state.couponDiscount,
    }));
  }, [state.items, state.coupon, state.couponDiscount]);

  const subtotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryCharge = subtotal === 0 ? 0 : subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_CHARGE;
  const taxAmount = Math.round(subtotal * TAX_RATE);
  const total = subtotal + deliveryCharge + taxAmount - state.couponDiscount;
  const itemCount = state.items.reduce((s, i) => s + i.quantity, 0);

  const addItem = (item) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (cartId) => dispatch({ type: 'REMOVE_ITEM', payload: cartId });
  const updateQty = (cartId, qty) => dispatch({ type: 'UPDATE_QTY', payload: { cartId, qty } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });
  const applyCoupon = (code) => dispatch({ type: 'APPLY_COUPON', payload: code });
  const removeCoupon = () => dispatch({ type: 'REMOVE_COUPON' });

  return (
    <CartContext.Provider value={{
      ...state, subtotal, deliveryCharge, taxAmount, total, itemCount,
      addItem, removeItem, updateQty, clearCart, applyCoupon, removeCoupon,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
