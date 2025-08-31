# Treasure Hunt Removal Guide

This document explains how to completely remove the treasure hunt feature from the CodeMonk project.

## Files Modified

### 1. `/client/src/utils/treasureHunt.jsx`
**Action:** Delete entire file
```bash
rm src/utils/treasureHunt.jsx
```

### 2. `/client/src/components/home/Footer.jsx`
**Action:** Remove treasure hunt imports and modifications

**Remove these lines:**
```jsx
/* === TREASURE HUNT START === */
import { useTreasureHunt } from '../../utils/treasureHunt.jsx';
/* === TREASURE HUNT END === */
```

**Remove these lines:**
```jsx
/* === TREASURE HUNT START === */
const { firstFound, clickCount, handleFirstTreasure } = useTreasureHunt();
/* === TREASURE HUNT END === */
```

**Revert the h3 element back to:**
```jsx
<motion.h3 
  className="text-2xl font-bold text-blue-400 mb-4"
  whileHover={{ scale: 1.05, color: "#60a5fa" }}
  transition={{ duration: 0.3 }}
>
  Code Monk
</motion.h3>
```

### 3. `/client/src/pages/Team.jsx`
**Action:** Remove treasure hunt imports and modifications

**Remove these lines:**
```jsx
/* === TREASURE HUNT START === */
import { useTreasureHunt, EditableText } from '../utils/treasureHunt.jsx';
/* === TREASURE HUNT END === */
```

**Remove these lines:**
```jsx
/* === TREASURE HUNT START === */
const { secondFound, handleSecondTreasure } = useTreasureHunt();
/* === TREASURE HUNT END === */
```

**Revert the h1 element back to:**
```jsx
<h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
  Meet The Cold Monk Team
</h1>
```

## Clean Up localStorage (Optional)

If you want to clear any saved treasure hunt data from users' browsers, they can run this in the browser console:
```javascript
localStorage.removeItem('treasureHunt.firstFound');
localStorage.removeItem('treasureHunt.secondFound');
```

## Verification

After removal, ensure:
1. No console errors in browser developer tools
2. Footer displays "Code Monk" normally without click functionality
3. Team page displays "Meet The Cold Monk Team" without editable text
4. No remaining treasure hunt related imports or functions

## Complete Removal Script

You can run this bash script to remove all treasure hunt code at once:

```bash
#!/bin/bash
# Remove treasure hunt utility file
rm -f src/utils/treasureHunt.jsx

# TODO: Manual removal required for specific lines in Footer.jsx and Team.jsx
# Follow the instructions above to clean the specific commented sections
```

All treasure hunt functionality is contained within `/* === TREASURE HUNT START === */` and `/* === TREASURE HUNT END === */` comments for easy identification and removal.
