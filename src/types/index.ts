// src/types/index.ts
export type PageView = 
  | "home" | "museum" | "forum" | "login" | "register" | "create" | "tryon" 
  | "profile" | "edit" | "payment" 
  | "shop" | "productDetail" | "cart" | "checkout" | "orders" 
  | "merchantDashboard" | "merchantApply";
export interface Message {
    role: "user" | "model";
    text: string;
  }
  
  export interface MarketDetail {
    name: string;
    hours: string;
    tips: string;
    products: string;
  }


  export interface Product {
    id: number;
    merchant_id: number;
    shop_name: string;
    title: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    status: 'active' | 'sold_out' | 'deleted';
    cover_image: string;
    images: string[];
    created_at: string;
  }
  
  export interface CartItem {
    cart_item_id: number;
    product_id: number;
    quantity: number;
    price: number;
    title: string;
    cover_image: string;
    shop_name: string;
    stock: number;
  }
  
  export interface Order {
    id: number;
    total_amount: number;
    fee: number;
    status: 'pending_payment' | 'paid' | 'shipped' | 'completed' | 'cancelled';
    created_at: string;
    item_count: number;
    items?: OrderItem[];
  }
  
  export interface OrderItem {
    product_id: number;
    title: string;
    cover_image: string;
    quantity: number;
    price: number;
  }
  
  export interface MerchantInfo {
    shop_name: string;
    expire_date: string;
  }