export interface CartItem {
    medData: {
      medID: string;
      name: string;
      medType: string;
      pricePerTab: number;
    };
    quantity: number;
  }
  
  const CART_KEY = "mims_billing_cart";
  
  export const saveCart = (cart: CartItem[]) => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  };
  
  export const loadCart = (): CartItem[] => {
    try {
      const cart = localStorage.getItem(CART_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error("Failed to load cart:", error);
      return [];
    }
  };
  
  export const clearCart = () => {
    try {
      localStorage.removeItem(CART_KEY);
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };
