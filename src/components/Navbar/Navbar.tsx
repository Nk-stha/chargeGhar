"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiMapPin,
  FiFileText,
  FiActivity,
  FiMenu,
  FiX,
  FiPackage,
  FiGift,
  FiAward,
  FiTrendingUp,
  FiChevronDown,
  FiChevronRight,
  FiBarChart2,
  FiDollarSign,
  FiRotateCcw,
  FiShoppingBag,
  FiAlertCircle,
  FiImage,
  FiGrid,
  FiUserCheck,
} from "react-icons/fi";
import styles from "./Navbar.module.css";

interface SubMenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  subItems?: SubMenuItem[];
}

const Navbar: React.FC = () => {
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [hoveredParent, setHoveredParent] = useState<string | null>(null);
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { icon: <FiHome />, label: "Dashboard", href: "/dashboard" },
    { icon: <FiMapPin />, label: "Station", href: "/dashboard/stations" },
    { icon: <FiUsers />, label: "Users", href: "/dashboard/users" },
    { icon: <FiFileText />, label: "KYC", href: "/dashboard/kyc" },
    { icon: <FiShoppingBag />, label: "Rentals", href: "/dashboard/rentals" },
    {
      icon: <FiAlertCircle />,
      label: "Issues",
      subItems: [
        {
          icon: <FiAlertCircle />,
          label: "Rental Issues",
          href: "/dashboard/issues/rental-issues",
        },
        {
          icon: <FiAlertCircle />,
          label: "Station Issues",
          href: "/dashboard/issues/station-issues",
        },
      ],
    },
    {
      icon: <FiGift />,
      label: "Promotion",
      subItems: [
        { icon: <FiPackage />, label: "Package", href: "/dashboard/packages" },
        { icon: <FiGift />, label: "Coupons", href: "/dashboard/coupons" },
        { icon: <FiAward />, label: "Points", href: "/dashboard/points" },
        {
          icon: <FiTrendingUp />,
          label: "Achievements",
          href: "/dashboard/achievements",
        },
        {
          icon: <FiUserCheck />,
          label: "Referrals",
          href: "/dashboard/referrals",
        },
        {
          icon: <FiUsers />,
          label: "Leaderboard",
          href: "/dashboard/leaderboard",
        },
      ],
    },
    {
      icon: <FiBarChart2 />,
      label: "Analytics",
      subItems: [
        {
          icon: <FiActivity />,
          label: "Admin Logs",
          href: "/dashboard/admin-logs",
        },
        {
          icon: <FiFileText />,
          label: "System Logs",
          href: "/dashboard/system-logs",
        },
      ],
    },
    {
      icon: <FiDollarSign />,
      label: "Transactions",
      subItems: [
        {
          icon: <FiFileText />,
          label: "All Transactions",
          href: "/dashboard/transactions",
        },
        {
          icon: <FiDollarSign />,
          label: "Withdrawals",
          href: "/dashboard/transactions/withdrawals",
        },
        {
          icon: <FiRotateCcw />,
          label: "Refunds",
          href: "/dashboard/transactions/refunds",
        },
      ],
    },
    {
      icon: <FiSettings />,
      label: "Settings",
      subItems: [
        {
          icon: <FiImage />,
          label: "Content",
          href: "/dashboard/settings/content-management",
        },
        {
          icon: <FiImage />,
          label: "Media Library",
          href: "/dashboard/settings/media-library",
        },
        {
          icon: <FiSettings />,
          label: "Config",
          href: "/dashboard/settings/config",
        },
        {
          icon: <FiGrid />,
          label: "Amenities",
          href: "/dashboard/settings/amenities",
        },
        {
          icon: <FiDollarSign />,
          label: "Late Fee Configs",
          href: "/dashboard/settings/late-fee-configs",
        },
      ],
    },
  ];

  // Check if current path matches any submenu item and auto-expand parent
  useEffect(() => {
    const newExpandedItems: string[] = [];
    navItems.forEach((item) => {
      if (item.subItems) {
        const hasActiveSubItem = item.subItems.some((subItem) =>
          pathname.startsWith(subItem.href),
        );
        if (hasActiveSubItem) {
          newExpandedItems.push(item.label);
        }
      }
    });
    setExpandedItems(newExpandedItems);
  }, [pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label],
    );
  };

  const handleParentHover = (label: string) => {
    setHoveredParent(label);
  };

  const handleParentLeave = () => {
    setHoveredParent(null);
  };

  const isActive = (href?: string, subItems?: SubMenuItem[]) => {
    if (href) {
      return (
        pathname === href ||
        (href !== "/dashboard" && pathname.startsWith(href))
      );
    }
    if (subItems) {
      return subItems.some((subItem) => pathname.startsWith(subItem.href));
    }
    return false;
  };

  const isExpanded = (label: string) => {
    // On mobile, use click-based expansion
    if (mobileOpen) {
      return expandedItems.includes(label);
    }
    // On desktop, use hover or permanent expansion if active
    return expandedItems.includes(label) || hoveredParent === label;
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        className={styles.menuToggle}
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Mobile Overlay */}
      <div
        className={`${styles.overlay} ${mobileOpen ? styles.active : ""}`}
        onClick={closeMobileMenu}
      />

      {/* Navbar */}
      <nav
        className={`${styles.navbar} ${hovered ? styles.expanded : ""} ${mobileOpen ? styles.mobileOpen : ""
          }`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <ul className={styles.navList}>
          {navItems.map((item, index) => {
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const itemIsExpanded = hasSubItems && isExpanded(item.label);
            const itemIsActive = isActive(item.href, item.subItems);

            return (
              <li key={index}>
                {hasSubItems ? (
                  <div
                    className={styles.menuItemContainer}
                    onMouseEnter={() =>
                      !mobileOpen && handleParentHover(item.label)
                    }
                    onMouseLeave={() => !mobileOpen && handleParentLeave()}
                  >
                    {/* Parent Item with Submenu */}
                    <div
                      className={`${styles.navItem} ${styles.parentItem} ${itemIsActive ? styles.active : ""
                        }`}
                      onClick={() => mobileOpen && toggleExpanded(item.label)}
                    >
                      <span className={styles.icon}>{item.icon}</span>
                      <span className={styles.label}>{item.label}</span>
                      <span className={styles.chevron}>
                        {itemIsExpanded ? (
                          <FiChevronDown />
                        ) : (
                          <FiChevronRight />
                        )}
                      </span>
                    </div>

                    {/* Submenu */}
                    <ul
                      className={`${styles.subMenu} ${itemIsExpanded ? styles.subMenuOpen : ""
                        }`}
                    >
                      {item.subItems?.map((subItem, subIndex) => {
                        const subItemIsActive = pathname.startsWith(
                          subItem.href,
                        );
                        return (
                          <li key={subIndex}>
                            <Link
                              href={subItem.href}
                              className={`${styles.subNavItem} ${subItemIsActive ? styles.active : ""
                                }`}
                            >
                              <span className={styles.subIcon}>
                                {subItem.icon}
                              </span>
                              <span className={styles.label}>
                                {subItem.label}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <>
                    {/* Regular Item without Submenu */}
                    <Link
                      href={item.href!}
                      className={`${styles.navItem} ${itemIsActive ? styles.active : ""
                        }`}
                    >
                      <span className={styles.icon}>{item.icon}</span>
                      <span className={styles.label}>{item.label}</span>
                    </Link>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
