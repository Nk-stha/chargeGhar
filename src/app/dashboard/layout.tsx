// src/app/dashboard/layout.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardDataProvider } from '../../contexts/DashboardDataContext';
import Header from "@/components/Header/Header";
import DashboardSidebar from "@/components/DashboardSidebar/DashboardSidebar";
import styles from "./dashboard.module.css";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const toggleMobileMenu = useCallback(() => {
        setMobileMenuOpen(prev => !prev);
    }, []);

    const closeMobileMenu = useCallback(() => {
        setMobileMenuOpen(false);
    }, []);

    const toggleSidebar = useCallback(() => {
        setSidebarCollapsed(prev => !prev);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp * 1000 < Date.now();

            if (isExpired) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                router.push('/login');
            } else {
                setIsAuthenticated(true);
            }
        } catch (error) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            router.push('/login');
        }
    }, [router]);

    if (!isAuthenticated) {
        // You can render a loading spinner here while checking auth
        return null;
    }

    return (
        <DashboardDataProvider>
            <div className={styles.layout}>
                <DashboardSidebar 
                    mobileOpen={mobileMenuOpen} 
                    onMobileClose={closeMobileMenu}
                    collapsed={sidebarCollapsed}
                    onToggleCollapse={toggleSidebar}
                />
                <div className={`${styles.main} ${sidebarCollapsed ? styles.mainCollapsed : ''}`}>
                    <Header onMenuToggle={toggleMobileMenu} menuOpen={mobileMenuOpen} />
                    <main className={styles.content}>{children}</main>
                </div>
            </div>
        </DashboardDataProvider>
    );
}

