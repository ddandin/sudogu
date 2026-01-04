# Mobile Testing Guide - Sudogu

## 🚨 Important: If Changes Don't Appear on Mobile

Your CSS has been updated with all the mobile fixes, but browsers often cache CSS files aggressively. Follow these steps to see the changes:

### Step 1: Clear Browser Cache on Mobile

#### On iOS (Safari/Instagram):
1. **For Safari:**
   - Go to Settings → Safari
   - Scroll down and tap "Clear History and Website Data"
   - Confirm by tapping "Clear History and Data"

2. **For Instagram in-app browser:**
   - Close Instagram completely (swipe up from app switcher)
   - Go to Settings → Safari → Clear History and Website Data
   - Reopen Instagram and try your link again

#### On Android (Chrome/Instagram):
1. **For Chrome:**
   - Open Chrome
   - Tap the three dots (⋮) → Settings
   - Privacy and security → Clear browsing data
   - Select "Cached images and files"
   - Tap "Clear data"

2. **For Instagram in-app browser:**
   - Go to Settings → Apps → Instagram
   - Tap "Storage" → "Clear Cache" (NOT Clear Data)
   - Reopen Instagram

### Step 2: Hard Refresh (If Testing on Desktop)

- **Windows:** Ctrl + Shift + R or Ctrl + F5
- **Mac:** Cmd + Shift + R
- **Linux:** Ctrl + Shift + R

### Step 3: Add Cache-Busting to Your Files

If clearing cache doesn't work, you may need to force the browser to reload the CSS file.

**Add this to your [index.html](index.html) `<head>` section:**

Change this line:
```html
<link rel="stylesheet" href="styles.css">
```

To this (with a version parameter):
```html
<link rel="stylesheet" href="styles.css?v=2">
```

Every time you update CSS, change `?v=2` to `?v=3`, `?v=4`, etc.

---

## ✅ Verify Mobile Fixes Are Working

### Quick Visual Checklist

Open your game on mobile and check these items:

#### Controls Bar (Top)
- [ ] **Difficulty dropdown** - Should be small (0.7rem font), not too big
- [ ] **Timer toggle** - Should fit on same line
- [ ] **Pause toggle** - Should be fully visible, not cut off
- [ ] **Controls should wrap** - If screen is too narrow, controls move to second row (no cutoff)

#### Game Board
- [ ] **Board width** - Should be 350px max (not 310px)
- [ ] **Centered** - Should have equal space on left and right sides
- [ ] **No scrolling** - Should fit on screen without vertical scrolling

#### Controls Below Board
- [ ] **Restart button** - Should be small (28px height, 0.7rem font)
- [ ] **Undo/Redo buttons** - Should be small
- [ ] **Mistakes counter** - Should be small (0.7rem font)

#### Dog Panel (Bottom)
- [ ] **3×3 grid** - All 9 dogs visible
- [ ] **Last 3 dogs visible** - Bottom row (Ares, Tony, Hera) should fit on screen
- [ ] **Dog size** - Each dog should be 60px × 60px (not 65px)

---

## 🐛 Debugging: Check If CSS Is Loading

### Method 1: Developer Tools (Desktop Browser)

1. Open your page in Chrome/Firefox on desktop
2. Press F12 to open DevTools
3. Go to "Network" tab
4. Refresh the page (F5)
5. Look for `styles.css` in the list
6. Click on it
7. Check the "Response" tab - you should see the CSS code
8. Search for `@media (max-width: 768px)` - it should be there
9. Inside that media query, search for:
   - `.dog-item { width: 60px;` (NOT 65px)
   - `.difficulty-dropdown { font-size: 0.7rem;`
   - `.board-controls .icon-btn { height: 28px;`

### Method 2: Mobile Browser DevTools (Advanced)

#### iOS Safari:
1. Connect iPhone to Mac
2. On Mac: Safari → Develop → [Your iPhone] → [Your Page]
3. Use Web Inspector to check styles

#### Android Chrome:
1. Connect Android to PC with USB
2. On PC Chrome: chrome://inspect
3. Click "Inspect" next to your page
4. Use DevTools to check styles

### Method 3: Check Applied Styles (Easiest)

1. Open the game on mobile
2. Long-press on the Difficulty dropdown
3. If using iOS Safari, enable Web Inspector (Settings → Safari → Advanced → Web Inspector)
4. Check if font-size is 0.7rem or something larger

---

## 📊 Expected Mobile Styles

Here's what should be applied on screens **768px wide or less**:

```css
/* Controls */
.controls-bar { flex-wrap: wrap; gap: 6px; padding: 0 5px; }
.difficulty-dropdown { font-size: 0.7rem; font-weight: 600; min-width: 80px; }
.toggle-label { font-size: 0.7rem; }

/* Board */
.sudoku-board { max-width: 350px; }
.game-layout { padding-left: 45px; padding-right: 45px; } /* Equal! */

/* Dogs */
.dog-list { max-width: 350px; }
.dog-item { width: 60px; height: 60px; }

/* Buttons */
.board-controls .icon-btn { height: 28px; padding: 5px 8px; font-size: 0.7rem; }
.mobile-mistakes { padding: 5px 8px; gap: 3px; font-size: 0.7rem; }
```

---

## 🚀 Testing on Real Devices

### Instagram WebView Testing

1. **Post your link:**
   - Go to your Instagram profile
   - Edit profile → Add website link
   - OR post the link in your bio/story

2. **Test in Instagram:**
   - Open Instagram app
   - Tap the link (it opens in Instagram's in-app browser)
   - Verify all elements fit properly

3. **What to check:**
   - No horizontal scrolling
   - No vertical scrolling (game fits in one page)
   - Pause button fully visible
   - All 9 dogs visible
   - Difficulty dropdown small and readable
   - Game centered with equal padding

### Other WebViews to Test

- **Facebook:** Share link, open in Facebook app
- **Twitter:** Tweet link, open in Twitter app
- **Safari iOS:** Direct browser test
- **Chrome Android:** Direct browser test

---

## ❓ Still Not Working?

### Possible Issues:

1. **Old CSS file cached by server**
   - If you're using a hosting service (Netlify, Vercel, GitHub Pages), redeploy
   - Wait 5-10 minutes for CDN cache to clear

2. **CSS file not uploaded**
   - Check your hosting dashboard
   - Verify `styles.css` has the latest timestamp
   - Re-upload if necessary

3. **Different file being loaded**
   - Check [index.html](index.html) `<link>` tags
   - Make sure it's loading the correct `styles.css` file
   - Check for any alternative/minified CSS files

4. **Media query not matching**
   - Check your phone's screen width
   - On most phones: 360px - 428px wide
   - Media query triggers at `max-width: 768px`
   - Use `window.innerWidth` in console to verify

---

## 🆘 Debug Commands

Copy-paste these in your mobile browser console:

```javascript
// Check viewport width
console.log('Screen width:', window.innerWidth);
console.log('Should trigger mobile styles:', window.innerWidth <= 768);

// Check if webview detection is working
console.log('Is Instagram:', document.body.classList.contains('instagram-webview'));
console.log('Is WebView:', document.body.classList.contains('mobile-webview'));

// Check computed styles for dog-item
const dogItem = document.querySelector('.dog-item');
if (dogItem) {
    const styles = window.getComputedStyle(dogItem);
    console.log('Dog width:', styles.width, '(should be 60px)');
    console.log('Dog height:', styles.height, '(should be 60px)');
}

// Check difficulty dropdown
const dropdown = document.querySelector('.difficulty-dropdown');
if (dropdown) {
    const styles = window.getComputedStyle(dropdown);
    console.log('Dropdown font-size:', styles.fontSize, '(should be 11.2px = 0.7rem)');
    console.log('Dropdown font-weight:', styles.fontWeight, '(should be 600)');
}

// Check game layout padding
const layout = document.querySelector('.game-layout');
if (layout) {
    const styles = window.getComputedStyle(layout);
    console.log('Layout padding-left:', styles.paddingLeft);
    console.log('Layout padding-right:', styles.paddingRight);
    console.log('(Should be equal and around 45px)');
}
```

---

## ✨ Summary of Changes

All the following fixes have been applied to your [styles.css](styles.css) file:

1. ✅ **Controls bar wraps** - Added `flex-wrap: wrap` to prevent Pause button cutoff
2. ✅ **Equal padding** - Changed right padding from 5px to 45px (matches left)
3. ✅ **Smaller Difficulty dropdown** - Reduced to 0.7rem, 600 weight, 80px min-width
4. ✅ **Smaller Restart button** - 28px height, 5px/8px padding, 0.7rem font
5. ✅ **Smaller Mistakes button** - 28px height, 3px gap, 0.7rem font
6. ✅ **Smaller dog items** - 60px × 60px (was 65px)
7. ✅ **Wider game board** - 350px max-width (was 310px)
8. ✅ **Wider dog list** - 350px max-width (matches board)

If you've cleared cache and still don't see changes, the CSS file may not be deployed/uploaded to your server yet!
