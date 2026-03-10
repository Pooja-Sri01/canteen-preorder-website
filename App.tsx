
import React, { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage';
import CanteenSelectionPage from './pages/CanteenSelectionPage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import OrderReceiptPage from './pages/OrderConfirmationPage';
import PaymentPage from './pages/PaymentPage';
import ProfilePage from './pages/ProfilePage';
import { FoodItem, Canteen, Order, CartItem, Page } from './types';

const App: React.FC = () => {
    const [page, setPage] = useState<Page>('home');
    const [selectedCanteen, setSelectedCanteen] = useState<Canteen | null>(null);
    const [latestOrder, setLatestOrder] = useState<Order | null>(null);
    const [loggedInCanteenId, setLoggedInCanteenId] = useState<number | null>(null);
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [pendingOrder, setPendingOrder] = useState<Omit<Order, 'id' | 'date' | 'status' | 'paymentStatus' | 'orderNumber'> | null>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
    const [newOrderNotificationCount, setNewOrderNotificationCount] = useState(0);

    useEffect(() => {
        const storedEmail = localStorage.getItem('canteenUserEmail');
        if (storedEmail) {
            setCurrentUserEmail(storedEmail);
        }
    }, []);

    const navigate = useCallback((page: Page) => {
        setPage(page);
    }, []);

    const handleSelectCanteen = (canteen: Canteen) => {
        setSelectedCanteen(canteen);
        navigate('menu');
    };
    
    const createOrder = (orderData: Omit<Order, 'id' | 'date' | 'status' | 'paymentStatus' | 'orderNumber'>) => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const todaysOrders = allOrders.filter(order => new Date(order.date) >= startOfToday);
        const newOrderNumber = todaysOrders.length + 1;

        const newOrder: Order = {
            id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            orderNumber: newOrderNumber,
            ...orderData,
            date: new Date(),
            status: 'Pending',
            paymentStatus: orderData.paymentMethod === 'Online' ? 'Paid' : 'Unpaid',
        };
        setAllOrders(prevOrders => [...prevOrders, newOrder]);
        setLatestOrder(newOrder);
        setNewOrderNotificationCount(prev => prev + 1); // Increment notification count
        navigate('confirmation');
    };
    
    const clearNewOrderNotification = useCallback(() => {
        setNewOrderNotificationCount(0);
    }, []);

    const handleUpdateOrder = (updatedOrder: Order) => {
        setAllOrders(prevOrders =>
            prevOrders.map(order => (order.id === updatedOrder.id ? updatedOrder : order))
        );
    };

    const handlePlaceOrder = (orderData: { email: string; items: CartItem[]; totalPrice: number; paymentMethod: 'Online' | 'Offline' }) => {
        const subtotal = orderData.totalPrice;
        const taxes = subtotal * 0.05; // 5% tax
        const finalTotalPrice = subtotal + taxes;

        const completeOrderData: Omit<Order, 'id' | 'date' | 'status' | 'paymentStatus' | 'orderNumber'> = {
            ...orderData,
            totalPrice: finalTotalPrice,
            subtotal,
            taxes,
        };

        localStorage.setItem('canteenUserEmail', orderData.email);
        setCurrentUserEmail(orderData.email);

        if (orderData.paymentMethod === 'Online') {
            setPendingOrder(completeOrderData);
            navigate('payment');
        } else {
            createOrder(completeOrderData);
        }
    };
    
    const handleConfirmPayment = () => {
        if (pendingOrder) {
            localStorage.setItem('canteenUserEmail', pendingOrder.email);
            setCurrentUserEmail(pendingOrder.email);
            createOrder(pendingOrder);
            setPendingOrder(null);
        }
    };

    const handleAdminLogin = (canteenId: number) => {
        setLoggedInCanteenId(canteenId);
        navigate('admin-dashboard');
    };
    
    const handleAdminLogout = () => {
        setLoggedInCanteenId(null);
        navigate('home');
    };
    
    const handleUserLogout = () => {
        setCurrentUserEmail(null);
        localStorage.removeItem('canteenUserEmail');
        navigate('home');
    };

    const renderPage = () => {
        const headerProps = { currentUserEmail, onUserLogout: handleUserLogout };

        switch (page) {
            case 'home':
                return <HomePage navigate={navigate} />;
            case 'canteens':
                return <CanteenSelectionPage onSelectCanteen={handleSelectCanteen} navigate={navigate} {...headerProps} />;
            case 'menu':
                return selectedCanteen ? <MenuPage canteen={selectedCanteen} navigate={navigate} {...headerProps} /> : <CanteenSelectionPage onSelectCanteen={handleSelectCanteen} navigate={navigate} {...headerProps}/>;
            case 'cart':
                return <CartPage navigate={navigate} onPlaceOrder={handlePlaceOrder} {...headerProps} />;
            case 'payment':
                return pendingOrder ? <PaymentPage pendingOrder={pendingOrder} onConfirmPayment={handleConfirmPayment} navigate={navigate} /> : <CartPage navigate={navigate} onPlaceOrder={handlePlaceOrder} {...headerProps} />;
            case 'confirmation':
                return latestOrder ? <OrderReceiptPage latestOrder={latestOrder} navigate={navigate} /> : <HomePage navigate={navigate} />;
            case 'admin-login':
                return <AdminLoginPage onLoginSuccess={handleAdminLogin} navigate={navigate} />;
            case 'admin-dashboard':
                 return loggedInCanteenId ? <AdminDashboardPage navigate={navigate} allOrders={allOrders} loggedInCanteenId={loggedInCanteenId} onLogout={handleAdminLogout} onUpdateOrder={handleUpdateOrder} newOrderNotificationCount={newOrderNotificationCount} onClearNotification={clearNewOrderNotification} /> : <AdminLoginPage onLoginSuccess={handleAdminLogin} navigate={navigate} />;
            case 'profile':
                 return currentUserEmail ? <ProfilePage navigate={navigate} allOrders={allOrders} currentUserEmail={currentUserEmail} onUserLogout={handleUserLogout} /> : <HomePage navigate={navigate} />;
            default:
                return <HomePage navigate={navigate} />;
        }
    };

    return (
        <CartProvider>
            <div className="min-h-screen font-sans text-gray-800 dark:text-gray-200">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={page}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderPage()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </CartProvider>
    );
};

export default App;
