"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome,
  FiUsers,
  FiSettings,
  FiMapPin,
  FiFileText,
  FiActivity,
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
  FiLogOut,
  FiUser,
  FiSearch,
  FiChevronsLeft,
  FiChevronsRight,
  FiBattery,
} from "react-icons/fi";
import styles from "./DashboardSidebar.module.css";

interface SubMenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href?: string;
  subItems?: SubMenuItem[];
  badge?: number;
}

interface NavCategory {
  title: string;
  items: NavItem[];
}

interface DashboardSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  mobileOpen = false, 
  onMobileClose 
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const sidebarRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const navCategories: NavCategory[] = [
    {
      title: "Main",
      items: [
        { icon: <FiHome />, label: "Dashboard", href: "/dashboard" },
        { icon: <FiUsers />, label: "Users", href: "/dashboard/users" },
        { icon: <FiShoppingBag />, label: "Rentals", href: "/dashboard/rentals" },
      ],
    },
    {
      title: "Devices",
      items: [
        {
          icon: <FiGrid />,
          label: "Devices",
          subItems: [
            { icon: <FiMapPin />, label: "Stations", href: "/dashboard/stations" },
            { icon: <FiBattery />, label: "PowerBanks", href: "/dashboard/powerbanks" },
          ],
        },
      ],
    },
    {
      title: "Management",
      items: [
        { icon: <FiFileText />, label: "KYC", href: "/dashboard/kyc" },
        {
          icon: <FiAlertCircle />,
          label: "Issues",
          badge: 3,
          subItems: [
            {
              icon: <FiAlertCircle />,
              label: "Rental Issues",
              href: "/dashboard/issues/rental-issues",
              badge: 2,
            },
            {
              icon: <FiAlertCircle />,
              label: "Station Issues",
              href: "/dashboard/issues/station-issues",
              badge: 1,
            },
          ],
        },
        {
          icon: <FiGift />,
          label: "Promotions",
          subItems: [
            { icon: <FiPackage />, label: "Packages", href: "/dashboard/packages" },
            { icon: <FiGift />, label: "Coupons", href: "/dashboard/coupons" },
            { icon: <FiAward />, label: "Points", href: "/dashboard/points" },
            { icon: <FiTrendingUp />, label: "Achievements", href: "/dashboard/achievements" },
            { icon: <FiUserCheck />, label: "Referrals", href: "/dashboard/referrals" },
            { icon: <FiUsers />, label: "Leaderboard", href: "/dashboard/leaderboard" },
          ],
        },
      ],
    },
    {
      title: "Analytics & Finance",
      items: [
        {
          icon: <FiBarChart2 />,
          label: "Analytics",
          subItems: [
            { icon: <FiActivity />, label: "Admin Logs", href: "/dashboard/admin-logs" },
            { icon: <FiFileText />, label: "System Logs", href: "/dashboard/system-logs" },
          ],
        },
        {
          icon: <FiDollarSign />,
          label: "Transactions",
          subItems: [
            { icon: <FiFileText />, label: "All Transactions", href: "/dashboard/transactions" },
            { icon: <FiDollarSign />, label: "Withdrawals", href: "/dashboard/transactions/withdrawals" },
            { icon: <FiRotateCcw />, label: "Refunds", href: "/dashboard/transactions/refunds" },
          ],
        },
      ],
    },
    {
      title: "System",
      items: [
        {
          icon: <FiSettings />,
          label: "Settings",
          subItems: [
            { icon: <FiImage />, label: "Content", href: "/dashboard/settings/content-management" },
            { icon: <FiImage />, label: "Media Library", href: "/dashboard/settings/media-library" },
            { icon: <FiSettings />, label: "Configuration", href: "/dashboard/settings/config" },
            { icon: <FiGrid />, label: "Amenities", href: "/dashboard/settings/amenities" },
            { icon: <FiDollarSign />, label: "Late Fee Configs", href: "/dashboard/settings/late-fee-configs" },
          ],
        },
      ],
    },
  ];

  // Auto-expand parent if child is active
  useEffect(() => {
    const newExpandedItems: string[] = [];
    navCategories.forEach((category) => {
      category.items.forEach((item) => {
        if (item.subItems) {
          const hasActiveSubItem = item.subItems.some((subItem) =>
            pathname.startsWith(subItem.href)
          );
          if (hasActiveSubItem) {
            newExpandedItems.push(item.label);
          }
        }
      });
    });
    setExpandedItems(newExpandedItems);
  }, [pathname]);

  // Close mobile menu on route change (but not on mount)
  useEffect(() => {
    // Only close if menu is open (avoids unnecessary calls)
    if (mobileOpen && onMobileClose) {
      onMobileClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  // Click outside to close/collapse sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedElement = event.target as HTMLElement;
      
      // Check if click is outside sidebar
      if (sidebarRef.current && !sidebarRef.current.contains(target)) {
        // Check if click is not on the toggle button or collapse button
        const isToggleButton = clickedElement.closest('button[aria-label="Toggle menu"]');
        const isCollapseButton = clickedElement.closest(`.${styles.collapseToggle}`);
        
        if (!isToggleButton && !isCollapseButton) {
          // On mobile: close the sidebar
          if (mobileOpen && onMobileClose) {
            console.log('Mobile: Click outside detected, closing sidebar');
            onMobileClose();
          }
          // On desktop: collapse the sidebar if expanded
          else if (window.innerWidth > 768 && !collapsed) {
            console.log('Desktop: Click outside detected, collapsing sidebar');
            setCollapsed(true);
          }
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen, collapsed, onMobileClose]);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (href?: string, subItems?: SubMenuItem[]) => {
    if (href) {
      return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
    }
    if (subItems) {
      return subItems.some((subItem) => pathname.startsWith(subItem.href));
    }
    return false;
  };

  const handleLogout = () => {
    router.push("/login");
  };

  // Filter navigation items based on search query
  const filterItems = (items: NavItem[]): NavItem[] => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    const filtered: NavItem[] = [];

    items.forEach((item) => {
      // Check if parent item matches
      const parentMatches = item.label.toLowerCase().includes(query);

      // Check if any submenu item matches
      const filteredSubItems = item.subItems?.filter((subItem) =>
        subItem.label.toLowerCase().includes(query)
      );

      // Include item if parent matches or has matching subitems
      if (parentMatches || (filteredSubItems && filteredSubItems.length > 0)) {
        filtered.push({
          ...item,
          subItems: filteredSubItems && filteredSubItems.length > 0 ? filteredSubItems : item.subItems,
        });
      }
    });

    return filtered;
  };

  // Filter categories based on search
  const filteredCategories = navCategories
    .map((category) => ({
      ...category,
      items: filterItems(category.items),
    }))
    .filter((category) => category.items.length > 0);

  // Auto-expand items when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const itemsToExpand: string[] = [];
      filteredCategories.forEach((category) => {
        category.items.forEach((item) => {
          if (item.subItems && item.subItems.length > 0) {
            itemsToExpand.push(item.label);
          }
        });
      });
      setExpandedItems(itemsToExpand);
    }
  }, [searchQuery]);

  const handleOverlayClick = () => {
    console.log('Overlay clicked');
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className={styles.overlay} 
          onClick={handleOverlayClick}
          style={{ pointerEvents: 'auto' }}
        />
      )}

      {/* Sidebar */}
      <nav 
        ref={sidebarRef}
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""} ${mobileOpen ? styles.mobileOpen : ""}`}
      >
        {/* Search Bar */}
        {!collapsed && (
          <div className={styles.searchContainer}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search navigation..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles.clearSearch}
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className={styles.navContainer}>
          {searchQuery && filteredCategories.length === 0 ? (
            <div className={styles.noResults}>
              <FiSearch />
              <p>No results found</p>
              <span>Try a different search term</span>
            </div>
          ) : (
            filteredCategories.map((category, catIndex) => (
              <div key={catIndex} className={styles.category}>
                {!collapsed && <div className={styles.categoryTitle}>{category.title}</div>}
                
                <ul className={styles.navList}>
                  {category.items.map((item, index) => {
                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const itemIsExpanded = hasSubItems && expandedItems.includes(item.label);
                    const itemIsActive = isActive(item.href, item.subItems);

                    return (
                      <li key={index}>
                        {hasSubItems ? (
                          <div>
                            <div
                              className={`${styles.navItem} ${styles.parentItem} ${itemIsActive ? styles.active : ""}`}
                              onClick={() => !searchQuery && toggleExpanded(item.label)}
                            >
                              <span className={styles.icon}>{item.icon}</span>
                              {!collapsed && (
                                <>
                                  <span className={styles.label}>{item.label}</span>
                                  {item.badge && <span className={styles.badge}>{item.badge}</span>}
                                  {!searchQuery && (
                                    <span className={styles.chevron}>
                                      {itemIsExpanded ? <FiChevronDown /> : <FiChevronRight />}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Submenu */}
                            {!collapsed && itemIsExpanded && (
                              <ul className={styles.subMenu}>
                                {item.subItems?.map((subItem, subIndex) => {
                                  const subItemIsActive = pathname.startsWith(subItem.href);
                                  return (
                                    <li key={subIndex}>
                                      <Link
                                        href={subItem.href}
                                        className={`${styles.subNavItem} ${subItemIsActive ? styles.active : ""}`}
                                      >
                                        <span className={styles.subIcon}>{subItem.icon}</span>
                                        <span className={styles.label}>{subItem.label}</span>
                                        {subItem.badge && <span className={styles.badge}>{subItem.badge}</span>}
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        ) : (
                          <Link
                            href={item.href!}
                            className={`${styles.navItem} ${itemIsActive ? styles.active : ""}`}
                          >
                            <span className={styles.icon}>{item.icon}</span>
                            {!collapsed && (
                              <>
                                <span className={styles.label}>{item.label}</span>
                                {item.badge && <span className={styles.badge}>{item.badge}</span>}
                              </>
                            )}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* User Section */}
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              <FiUser />
            </div>
            {!collapsed && (
              <div className={styles.userDetails}>
                <div className={styles.userName}>Admin</div>
                <div className={styles.userRole}>Super Admin</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
              <FiLogOut />
            </button>
          )}
        </div>

        {/* Collapse Toggle (Desktop Only) */}
        <button className={styles.collapseToggle} onClick={toggleCollapsed} title={collapsed ? "Expand" : "Collapse"}>
          {collapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
        </button>
      </nav>
    </>
  );
};

export default DashboardSidebar;
