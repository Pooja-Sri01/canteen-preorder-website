
export interface FoodItem {
    id: number;
    name: string;
    canteenId: number;
    price: number;
    available: boolean;
    rating: number;
}

export interface Canteen {
    id: number;
    name:string;
    imageUrl: string;
    backgroundUrl: string;
}

export interface CartItem extends FoodItem {
    quantity: number;
}

export interface Order {
    id: string;
    orderNumber: number;
    email: string;
    items: CartItem[];
    totalPrice: number;
    subtotal: number;
    taxes: number;
    date: Date;
    paymentMethod: 'Online' | 'Offline';
    status: 'Pending' | 'Ready' | 'Delivered';
    paymentStatus: 'Unpaid' | 'Paid';
}

// FIX: Add Feedback interface to resolve import error in useFeedbackData.ts
export interface Feedback {
    foodId: number;
    rating: number;
    comment: string;
    date: Date;
}

export type Page = 'home' | 'canteens' | 'menu' | 'cart' | 'admin-login' | 'admin-dashboard' | 'confirmation' | 'payment' | 'profile';