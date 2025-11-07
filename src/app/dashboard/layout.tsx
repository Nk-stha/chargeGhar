// src/app/dashboard/layout.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from "@/components/Navbar/Navbar";
import Header from "@/components/Header/Header";
import styles from "./dashboard.module.css";
import { DashboardDataProvider } from '../../contexts/DashboardDataContext';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

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
            console.error('Invalid token:', error);
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
                <Navbar />
                <div className={styles.main}>
                    <Header />
                    <main className={styles.content}>{children}</main>
                </div>
            </div>
        </DashboardDataProvider>
    );
}
