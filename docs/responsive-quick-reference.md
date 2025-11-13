# Responsive Design Quick Reference

## 📱 Breakpoints Overview

| Device Type | Width Range | Sidebar | Stats Grid | Key Changes |
|-------------|-------------|---------|------------|-------------|
| **Desktop** | >1024px | 70px → 220px (hover) | 5 columns | Full layout |
| **Tablet** | 769-1024px | 60px → 200px (hover) | 3-4 columns | Compact sidebar |
| **Mobile Landscape** | 481-768px | Off-canvas drawer | 2 columns | Hamburger menu |
| **Mobile Portrait** | 361-480px | Off-canvas drawer | 1 column | Single column |
| **Small Mobile** | ≤360px | Off-canvas drawer | 1 column | Ultra compact |

---

## 🎨 Color Palette (All Breakpoints)

```css
/* Primary Colors */
--primary-green: #82ea80;      /* Success, highlights */
--secondary-green: #47b216;    /* Hover, active states */

/* Backgrounds */
--bg-page: #0a0a0a;            /* Page background */
--bg-card: #121212;            /* Card backgrounds */
--bg-elevated: #1a1a1a;        /* Elevated elements */
--bg-navbar: #111;             /* Navbar background */

/* Text Colors */
--text-primary: #fff;          /* Primary text */
--text-secondary: #ccc;        /* Secondary text */
--text-muted: #888;            /* Muted text */
--text-meta: #666;             /* Meta info */

/* Borders */
--border-subtle: #1a1a1a;      /* Subtle borders */
--border-default: #2a2a2a;     /* Default borders */
```

---

## 🖥️ Desktop (>1024px)

### Layout
- **Navbar**: 70px collapsed, 220px on hover
- **Content Padding**: 2rem 3rem
- **Stats Grid**: 5 columns (auto-fit, min 220px)

### Interactions
- Hover to expand sidebar
- Hover effects on cards
- Full navigation labels on hover

### Typography
- H1: 2rem
- Stats Value: 1.75rem
- Stats Title: 0.875rem

---

## 📱 Tablet (769-1024px)

### Layout
- **Navbar**: 60px collapsed, 200px on hover
- **Content Padding**: 1.5rem 2rem
- **Stats Grid**: 3-4 columns

### Changes
- Slightly smaller sidebar
- Reduced spacing
- Maintained hover functionality

---

## 📱 Mobile (≤768px)

### Layout
- **Navbar**: Off-canvas drawer (260px)
- **Content Padding**: 1.25rem 1.5rem
- **Stats Grid**: 2 columns

### Key Features
- ✅ Hamburger menu (top-left)
- ✅ Slide-in navigation drawer
- ✅ Dark overlay backdrop
- ✅ Auto-close on navigation
- ✅ Body scroll lock when menu open

### Header Adjustments
- Logo: 32-36px
- Left padding: 60px (for menu button)

### Typography
- H1: 1.5rem
- Stats Value: 1.5rem

---

## 📱 Mobile Portrait (≤480px)

### Layout
- **Stats Grid**: 1 column (stacked)
- **Content Padding**: 1rem
- **Navbar Drawer**: 240px

### Typography
- H1: 1.25rem
- Stats Value: 1.4rem
- Reduced all sizes proportionally

---

## 🔧 Component Sizing Guide

### Stats Cards

| Breakpoint | Icon | Title | Value | Min Height |
|------------|------|-------|-------|------------|
| Desktop    | 60px | 0.875rem | 1.75rem | 100px |
| Tablet     | 55px | 0.85rem | 1.65rem | 90px |
| Mobile     | 50px | 0.8rem | 1.5rem | 85px |
| Small      | 45px | 0.7rem | 1.3rem | 75px |

### Touch Targets (Mobile)
- **Minimum**: 44x44px
- **Buttons**: 48px height minimum
- **Icons**: 1.3-1.5rem
- **Spacing**: 0.75rem minimum

---

## 🎯 Quick Feature Test

### Desktop Checklist
- [ ] Sidebar expands on hover
- [ ] 5-column stats grid displays
- [ ] Two-column sections side-by-side
- [ ] All hover effects work

### Tablet Checklist
- [ ] Compact 60px sidebar
- [ ] 3-4 column stats grid
- [ ] Hover still works
- [ ] No horizontal scroll

### Mobile Checklist
- [ ] Hamburger menu visible (top-left)
- [ ] Menu slides in smoothly
- [ ] Dark overlay appears
- [ ] Body scroll locks
- [ ] Stats in 2 columns
- [ ] Menu closes on navigation

### Mobile Portrait Checklist
- [ ] Stats in single column
- [ ] All text readable
- [ ] No horizontal scroll
- [ ] All buttons tappable

---

## 🐛 Common Issues & Quick Fixes

### Issue: Menu Won't Open
```javascript
// Check: Menu toggle button visible?
// Fix: Ensure mobile breakpoint is active (≤768px)
```

### Issue: Content Behind Navbar
```css
/* Fix: Add proper padding-left to header */
.header { padding-left: 60px; }
```

### Issue: Stats Cards Too Small
```css
/* Fix: Check min-width in grid */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
```

### Issue: Horizontal Scroll
```css
/* Fix: Add to container */
max-width: 100%;
overflow-x: hidden;
```

---

## 🎨 CSS Media Query Template

```css
/* Desktop - Default styles */
.element {
    /* Desktop styles */
}

/* Tablet */
@media (max-width: 1024px) {
    .element {
        /* Tablet adjustments */
    }
}

/* Mobile */
@media (max-width: 768px) {
    .element {
        /* Mobile styles */
    }
}

/* Small Mobile */
@media (max-width: 480px) {
    .element {
        /* Compact mobile */
    }
}

/* Extra Small */
@media (max-width: 360px) {
    .element {
        /* Minimal spacing */
    }
}
```

---

## 🚀 Quick Implementation Guide

### Adding New Component

1. **Start Mobile-First**
```css
.myComponent {
    /* Mobile styles first */
    padding: 1rem;
    font-size: 0.9rem;
}
```

2. **Add Tablet Enhancement**
```css
@media (min-width: 769px) {
    .myComponent {
        padding: 1.5rem;
        font-size: 1rem;
    }
}
```

3. **Add Desktop Enhancement**
```css
@media (min-width: 1025px) {
    .myComponent {
        padding: 2rem;
        font-size: 1.1rem;
    }
}
```

---

## 📊 Grid System Guide

### Stats Grid
```css
/* Auto-responsive grid */
display: grid;
grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
gap: 1.5rem;

/* Tablet */
@media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.25rem;
}

/* Mobile - 2 columns */
@media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}

/* Mobile - 1 column */
@media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.875rem;
}
```

---

## 🔍 Testing Shortcuts

### Chrome DevTools
```
1. Press F12
2. Click Toggle Device Toolbar (Ctrl+Shift+M)
3. Select device or enter custom dimensions
4. Test: 360px, 768px, 1024px, 1920px
```

### Real Device Testing
- **iOS**: iPhone SE (375px), iPhone 12 (390px)
- **Android**: Pixel 5 (393px), Galaxy S21 (360px)
- **Tablet**: iPad (768px), iPad Pro (1024px)

---

## 📱 Mobile Menu Code Snippet

```typescript
// In your component
const [mobileOpen, setMobileOpen] = useState(false);

// Toggle function
const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
};

// Auto-close on navigation
useEffect(() => {
    setMobileOpen(false);
}, [pathname]);

// Body scroll lock
useEffect(() => {
    if (mobileOpen) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "unset";
    }
}, [mobileOpen]);
```

---

## ✅ Pre-Deployment Checklist

- [ ] Test all breakpoints (360, 480, 768, 1024, 1920)
- [ ] Verify mobile menu opens/closes
- [ ] Check stats grid at each breakpoint
- [ ] Confirm no horizontal scroll
- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Verify iPad landscape/portrait
- [ ] Check Chrome, Firefox, Safari
- [ ] Validate touch targets (min 44px)
- [ ] Confirm color contrast ratios
- [ ] Test keyboard navigation
- [ ] Run npm run build successfully

---

## 🎯 Performance Tips

### Optimize for Mobile
- Use CSS transforms instead of position changes
- Minimize reflows/repaints
- Lazy load off-screen content
- Compress images
- Use system fonts when possible

### Animation Best Practices
```css
/* Good - GPU accelerated */
transform: translateX(0);
opacity: 1;

/* Avoid - triggers reflow */
left: 0;
width: 100%;
```

---

## 📚 File References

### Key Files Modified
- `src/app/dashboard/dashboard.module.css` - Layout & grid
- `src/components/Navbar/Navbar.tsx` - Mobile menu logic
- `src/components/Navbar/Navbar.module.css` - Responsive nav
- `src/components/Header/Header.module.css` - Header responsive
- `src/components/DashboardStatsCard/DashboardStats.module.css` - Stats grid
- `src/components/DashboardStatsCard/StatsCard.module.css` - Card sizing

---

## 🆘 Need Help?

1. **Check DevTools Console**: Look for errors
2. **Inspect Element**: Check actual computed styles
3. **Test Breakpoint**: Verify media query is active
4. **Clear Cache**: Hard refresh (Ctrl+Shift+R)
5. **Check Documentation**: See `responsive-design-implementation.md`

---

**Quick Reference Version**: 1.0  
**Last Updated**: November 2024  
**Status**: Production Ready ✅

For detailed documentation, see: `responsive-design-implementation.md`
