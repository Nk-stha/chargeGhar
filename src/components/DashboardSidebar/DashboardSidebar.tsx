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
  FiMonitor,
  FiBriefcase,
  FiPercent,
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
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  mobileOpen = false, 
  onMobileClose,
  collapsed = false,
  onToggleCollapse
}) => {
  // const [collapsed, setCollapsed] = useState(false); // Removed local state
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [hoveredParentItem, setHoveredParentItem] = useState<string | null>(null);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sidebarHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const navCategories: NavCategory[] = [
    {
      title: "Main",
      items: [
        { icon: <FiHome />, label: "Dashboard", href: "/dashboard" },
        { icon: <FiUsers />, label: "Users", href: "/dashboard/users" },
        { icon: <FiShoppingBag />, label: "Rentals", href: "/dashboard/rentals" },
        { icon: <FiMonitor />, label: "Ads", href: "/dashboard/ads" },
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
      title: "Partner Management",
      items: [
        {
          icon: <FiBriefcase />,
          label: "Partners",
          subItems: [
            { icon: <FiUsers />, label: "All Partners", href: "/dashboard/partners" },
            { icon: <FiMapPin />, label: "Station Distributions", href: "/dashboard/partners/station-distributions" },
            { icon: <FiBarChart2 />, label: "Revenue Analytics", href: "/dashboard/partners/revenue-analytics" },
            { icon: <FiDollarSign />, label: "Payouts", href: "/dashboard/payouts" },
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
          label: "Promotions",
          subItems: [
            { icon: <FiPackage />, label: "Packages", href: "/dashboard/packages" },
            { icon: <FiPercent />, label: "Discounts", href: "/dashboard/discounts" },
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
          else if (window.innerWidth > 768 && !collapsed && onToggleCollapse) {
            console.log('Desktop: Click outside detected, collapsing sidebar');
            onToggleCollapse();
          }
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen, collapsed, onMobileClose, onToggleCollapse]);

  // Keyboard navigation - Close mobile menu on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileOpen && onMobileClose) {
        onMobileClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, onMobileClose]);

  // Auto-scroll active item into view
  useEffect(() => {
    if (activeItemRef.current && navContainerRef.current) {
      const container = navContainerRef.current;
      const activeItem = activeItemRef.current;
      
      // Scroll into view with smooth behavior
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = activeItem.offsetTop;
      const itemHeight = activeItem.clientHeight;
      
      if (itemTop < scrollTop) {
        container.scrollTop = itemTop - 10;
      } else if (itemTop + itemHeight > scrollTop + containerHeight) {
        container.scrollTop = itemTop + itemHeight - containerHeight + 10;
      }
    }
  }, [pathname]);

  const toggleCollapsed = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    }
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const handleParentItemHover = (label: string, hasSubItems: boolean) => {
    // Don't expand on hover if searching or sidebar is collapsed
    if (!hasSubItems || searchQuery.trim() || collapsed) return;

    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Set a small delay before expanding on hover
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredParentItem(label);
      if (!expandedItems.includes(label)) {
        setExpandedItems((prev) => [...prev, label]);
      }
    }, 200);
  };

  const handleParentItemLeave = (label: string) => {
    // Don't collapse on leave if searching or sidebar is collapsed
    if (searchQuery.trim() || collapsed) return;

    // Clear timeout if mouse leaves before delay completes
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    setHoveredParentItem(null);
    // Collapse on leave (only if it was expanded by hover)
    setExpandedItems((prev) => prev.filter((item) => item !== label));
  };

  const handleSubMenuHover = () => {
    // Keep submenu open while hovering over it
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleSubMenuLeave = (label: string) => {
    // Don't collapse on leave if searching or sidebar is collapsed
    if (searchQuery.trim() || collapsed) return;

    // Collapse when leaving submenu
    setHoveredParentItem(null);
    setExpandedItems((prev) => prev.filter((item) => item !== label));
  };

  const handleSidebarHover = () => {
    // Only expand sidebar on hover if it's currently collapsed
    if (collapsed && onToggleCollapse) {
      if (sidebarHoverTimeoutRef.current) {
        clearTimeout(sidebarHoverTimeoutRef.current);
      }
      sidebarHoverTimeoutRef.current = setTimeout(() => {
        setSidebarHovered(true);
        onToggleCollapse();
      }, 100);
    }
  };

  const handleSidebarLeave = () => {
    // Only collapse sidebar on leave if it was expanded by hover
    if (sidebarHovered && collapsed === false && onToggleCollapse) {
      if (sidebarHoverTimeoutRef.current) {
        clearTimeout(sidebarHoverTimeoutRef.current);
      }
      sidebarHoverTimeoutRef.current = setTimeout(() => {
        setSidebarHovered(false);
        onToggleCollapse();
      }, 100);
    }
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
        onMouseEnter={handleSidebarHover}
        onMouseLeave={handleSidebarLeave}
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
        <div className={styles.navContainer} ref={navContainerRef}>
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
                          <div
                            onMouseEnter={() => handleParentItemHover(item.label, hasSubItems)}
                            onMouseLeave={() => handleParentItemLeave(item.label)}
                          >
                            <div
                              className={`${styles.navItem} ${styles.parentItem} ${itemIsActive ? styles.active : ""}`}
                              onClick={() => !searchQuery && toggleExpanded(item.label)}
                              ref={itemIsActive ? activeItemRef : null}
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
                              <ul 
                                className={styles.subMenu}
                                onMouseEnter={handleSubMenuHover}
                                onMouseLeave={() => handleSubMenuLeave(item.label)}
                              >
                                {(() => {
                                  // Find the best (most specific) matching sub-item
                                  const bestMatch = item.subItems
                                    ?.filter(si => pathname === si.href || pathname.startsWith(si.href + '/'))
                                    ?.sort((a, b) => b.href.length - a.href.length)?.[0]?.href;

                                  return item.subItems?.map((subItem, subIndex) => {
                                    const subItemIsActive = subItem.href === bestMatch;
                                    return (
                                      <li key={subIndex}>
                                        <Link
                                          href={subItem.href}
                                          className={`${styles.subNavItem} ${subItemIsActive ? styles.active : ""}`}
                                          ref={subItemIsActive ? activeItemRef : null}
                                        >
                                          <span className={styles.subIcon}>{subItem.icon}</span>
                                          <span className={styles.label}>{subItem.label}</span>
                                          {subItem.badge && <span className={styles.badge}>{subItem.badge}</span>}
                                        </Link>
                                      </li>
                                    );
                                  });
                                })()}
                              </ul>
                            )}
                          </div>
                        ) : (
                          <Link
                            href={item.href!}
                            className={`${styles.navItem} ${itemIsActive ? styles.active : ""}`}
                            ref={itemIsActive ? activeItemRef : null}
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
