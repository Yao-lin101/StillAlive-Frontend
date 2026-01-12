import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, User, Home, LogOut, LogIn } from 'lucide-react';
import { Dock, DockIcon } from '@/components/magicui/dock';
import { AuthContext } from '@/App';
import authService from '@/lib/auth';

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
    requireAuth?: boolean;
}

const navItems: NavItem[] = [
    { path: '/', label: '首页', icon: <Home className="w-5 h-5" /> },
    { path: '/survivors', label: '幸存者', icon: <Users className="w-5 h-5" /> },
    { path: '/characters', label: '我的角色', icon: <User className="w-5 h-5" />, requireAuth: true },
];

export const DockNav: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = React.useContext(AuthContext);

    const handleLogout = () => {
        authService.clearTokens();
        navigate('/');
    };

    const filteredNavItems = navItems.filter(item => {
        if (item.requireAuth && !isAuthenticated) return false;
        return true;
    });

    return (
        <div className="h-screen overflow-hidden bg-gradient-to-br from-[#FFE1E1] to-[#E3F4FF] dark:from-gray-900 dark:to-gray-800">
            {/* 主内容区 - 减去底部 Dock 的高度 */}
            <main className="h-[calc(100vh-90px)] overflow-auto">
                {children}
            </main>

            {/* 底部 Dock 导航 */}
            <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4">
                <Dock className="shadow-2xl">
                    {filteredNavItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/' && location.pathname.startsWith(item.path));

                        return (
                            <DockIcon
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                isActive={isActive}
                                tooltip={item.label}
                            >
                                {item.icon}
                            </DockIcon>
                        );
                    })}

                    {/* 分隔线 */}
                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1" />

                    {/* 登录/登出按钮 */}
                    {isAuthenticated ? (
                        <DockIcon
                            onClick={handleLogout}
                            tooltip="退出登录"
                            className="hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                        >
                            <LogOut className="w-5 h-5" />
                        </DockIcon>
                    ) : (
                        <DockIcon
                            onClick={() => navigate('/login')}
                            tooltip="登录"
                        >
                            <LogIn className="w-5 h-5" />
                        </DockIcon>
                    )}
                </Dock>
            </div>
        </div>
    );
};
