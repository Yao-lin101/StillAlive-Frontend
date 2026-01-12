import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, User, Home, Menu, X, LogOut, LogIn } from 'lucide-react';
import { AuthContext } from '@/App';
import authService from '@/lib/auth';

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
    requireAuth?: boolean;
    publicOnly?: boolean;
}

const navItems: NavItem[] = [
    { path: '/', label: '首页', icon: <Home className="w-5 h-5" /> },
    { path: '/survivors', label: '幸存者', icon: <Users className="w-5 h-5" /> },
    { path: '/characters', label: '我的角色', icon: <User className="w-5 h-5" />, requireAuth: true },
];

export const Sidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = React.useContext(AuthContext);

    const handleNavClick = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    const handleLogout = () => {
        authService.clearTokens();
        navigate('/');
        setIsOpen(false);
    };

    const filteredNavItems = navItems.filter(item => {
        if (item.requireAuth && !isAuthenticated) return false;
        if (item.publicOnly && isAuthenticated) return false;
        return true;
    });

    return (
        <div className="min-h-screen flex">
            {/* 桌面端侧边栏 */}
            <aside className="hidden md:flex flex-col w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-800/50">
                {/* Logo */}
                <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50">
                    <h1
                        className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        StillAlive
                    </h1>
                </div>

                {/* 导航项 */}
                <nav className="flex-1 p-4 space-y-2">
                    {filteredNavItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/' && location.pathname.startsWith(item.path));

                        return (
                            <button
                                key={item.path}
                                onClick={() => handleNavClick(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* 底部用户操作 */}
                <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">退出登录</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => handleNavClick('/login')}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200"
                        >
                            <LogIn className="w-5 h-5" />
                            <span className="font-medium">登录</span>
                        </button>
                    )}
                </div>
            </aside>

            {/* 移动端顶部导航栏 */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="flex items-center justify-between px-4 py-3">
                    <h1
                        className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        StillAlive
                    </h1>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* 移动端侧边抽屉 */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* 遮罩 */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="md:hidden fixed inset-0 z-40 bg-black/50"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* 抽屉 */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-gray-900 shadow-2xl"
                        >
                            {/* Logo */}
                            <div className="p-6 border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                                    StillAlive
                                </h1>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* 导航项 */}
                            <nav className="flex-1 p-4 space-y-2">
                                {filteredNavItems.map((item) => {
                                    const isActive = location.pathname === item.path ||
                                        (item.path !== '/' && location.pathname.startsWith(item.path));

                                    return (
                                        <button
                                            key={item.path}
                                            onClick={() => handleNavClick(item.path)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            {item.icon}
                                            <span className="font-medium">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>

                            {/* 底部用户操作 */}
                            <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
                                {isAuthenticated ? (
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span className="font-medium">退出登录</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleNavClick('/login')}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-200"
                                    >
                                        <LogIn className="w-5 h-5" />
                                        <span className="font-medium">登录</span>
                                    </button>
                                )}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* 主内容区 */}
            <main className="flex-1 md:ml-0 mt-14 md:mt-0">
                {children}
            </main>
        </div>
    );
};
