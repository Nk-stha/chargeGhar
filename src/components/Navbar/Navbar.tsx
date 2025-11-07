"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiShoppingCart,
  FiBarChart2,
  FiMapPin,
  FiFileText,
} from "react-icons/fi";
import styles from "./Navbar.module.css";

const Navbar: React.FC = () => {
  const [hovered, setHovered] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { icon: <FiHome />, label: "Dashboard", href: "/dashboard" },
    { icon: <FiMapPin />, label: "Stations", href: "/dashboard/stations" },
    { icon: <FiUsers />, label: "Users", href: "/dashboard/users" },
    { icon: <FiFileText />, label: "KYC", href: "/dashboard/kyc" },
    { icon: <FiShoppingCart />, label: "Rentals", href: "/dashboard/rentals" },
    {
      icon: <FiBarChart2 />,
      label: "Transactions",
      href: "/dashboard/transactions",
    },
    { icon: <FiSettings />, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <nav
      className={`${styles.navbar} ${hovered ? styles.expanded : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ul className={styles.navList}>
        {navItems.map((item, index) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <li key={index}>
              <Link
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navbar;
