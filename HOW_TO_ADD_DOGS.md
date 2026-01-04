# How to Add New Dogs to Sudogu

## 🐕 Quick Guide - 3 Simple Steps!

### Step 1: Add Dog Photos

Add **two photos** for each new dog to these folders:

1. **Regular photo**: `photos/DogName.png`
2. **Sleeping photo**: `photos/sleep/DogName-sleep.png`

**Example:**
```
photos/
├── Buddy.png          ← Regular photo
└── sleep/
    └── Buddy-sleep.png ← Sleeping photo
```

**Important Notes:**
- File names are **case-sensitive** (Buddy ≠ buddy)
- Use `.png` format for best quality
- Keep dog names simple (no spaces, special characters work fine)
- Sleeping photo should show the same dog in a restful pose

---

### Step 2: Update Configuration File

Open [dogs-config.js](dogs-config.js) and add your dog's name to the `AVAILABLE_DOGS` array:

**Before:**
```javascript
const AVAILABLE_DOGS = [
    'Leka',
    'Cosmo',
    'Maya',
    // ... other dogs
    'Skipper',

    // ADD NEW DOGS BELOW THIS LINE:
];
```

**After:**
```javascript
const AVAILABLE_DOGS = [
    'Leka',
    'Cosmo',
    'Maya',
    // ... other dogs
    'Skipper',

    // ADD NEW DOGS BELOW THIS LINE:
    'Buddy',       // ← Your new dog!
    'Max',         // ← Another one!
];
```

**Critical:** The name MUST match the filename exactly (case-sensitive)!
- ✅ File: `Buddy.png`, Config: `'Buddy'` → Works!
- ❌ File: `Buddy.png`, Config: `'buddy'` → Won't load!

---

### Step 3: Refresh the Page

That's it! Just refresh your browser and:

- ✅ Your new dog automatically appears in the game
- ✅ Automatically added to the favorite dog dropdown
- ✅ Available for random selection in new games
- ✅ Works immediately - no code changes needed!

---

## 📸 Photo Guidelines

### Regular Photo (`photos/DogName.png`)
- **Subject**: Clear photo of the dog's face or full body
- **Background**: Any background is fine, but clean/simple works best
- **Size**: Recommended 200x200px to 500x500px
- **Format**: PNG (supports transparency)
- **Quality**: High quality, well-lit photo

### Sleeping Photo (`photos/sleep/DogName-sleep.png`)
- **Subject**: Same dog in a sleeping or resting position
- **Pose**: Eyes closed, laying down, or relaxed position
- **Background**: Should match or complement the regular photo
- **Size**: Same as regular photo for consistency
- **Format**: PNG

---

## ✅ Testing Your New Dog

After adding the dog, open the browser console (F12) and you should see:

```
✅ Loaded 15 dogs: Leka, Cosmo, Maya, Rio, George, Gofret, Ares, Tony, Hera, Aria, Cookie, Lolo, Roxy, Skipper, Buddy
```

If you see a warning like:
```
⚠️ Dog "Buddy" listed in config but image not found at photos/Buddy.png
```

**Fix:**
1. Check that the file exists at the exact path
2. Verify the filename matches the config name (case-sensitive)
3. Make sure it's a `.png` file

---

## 🎮 How It Works

### Automatic Loading System

1. **On page load**, the game reads [dogs-config.js](dogs-config.js)
2. For each dog name in `AVAILABLE_DOGS`, it tries to load the image
3. If the image loads successfully, the dog is added to the game
4. If the image fails to load, a warning is shown (but game continues)
5. The favorite dog dropdown is automatically populated with all loaded dogs

### Dynamic Features

- **No hardcoding**: You never need to edit [sudoku.js](sudoku.js)
- **Validation**: Only dogs with valid images are loaded
- **Flexibility**: Add or remove dogs anytime
- **Error-proof**: Missing images are skipped gracefully

---

## 📝 Examples

### Example 1: Adding One Dog

**Files:**
```
photos/Luna.png
photos/sleep/Luna-sleep.png
```

**Configuration:**
```javascript
const AVAILABLE_DOGS = [
    // ... existing dogs
    'Luna',  // ← Add this line
];
```

**Result:**
- Luna appears in the game immediately
- Luna is added to favorite dog dropdown
- Game now has 15 total dogs (9 selected per game)

---

### Example 2: Adding Multiple Dogs

**Files:**
```
photos/Charlie.png
photos/sleep/Charlie-sleep.png
photos/Bella.png
photos/sleep/Bella-sleep.png
photos/Rocky.png
photos/sleep/Rocky-sleep.png
```

**Configuration:**
```javascript
const AVAILABLE_DOGS = [
    // ... existing dogs
    'Charlie',
    'Bella',
    'Rocky',
];
```

**Result:**
- 3 new dogs added
- Game now has 17 total dogs
- All three available in favorite dropdown

---

### Example 3: Dog with Special Characters

**Files:**
```
photos/Mr.Fluff.png
photos/sleep/Mr.Fluff-sleep.png
```

**Configuration:**
```javascript
const AVAILABLE_DOGS = [
    // ... existing dogs
    'Mr.Fluff',  // ← Periods are fine!
];
```

**Result:** Works perfectly! Special characters like periods, dashes, underscores are all supported.

---

## 🚨 Common Issues

### Issue 1: "Dog listed but image not found"

**Problem:** Warning in console about missing image

**Causes:**
- Typo in filename vs config name
- File in wrong folder
- Wrong file extension (.jpg instead of .png)
- Case mismatch (Windows users: be extra careful!)

**Fix:**
```bash
# Check exact filename
ls photos/
ls photos/sleep/

# Make sure it's exactly: photos/DogName.png
# And: photos/sleep/DogName-sleep.png
```

---

### Issue 2: Dog doesn't appear in dropdown

**Problem:** Added dog to config but don't see it in favorite dropdown

**Causes:**
- Image failed to load
- Didn't refresh the page
- JavaScript error (check console)

**Fix:**
1. Open browser console (F12)
2. Look for error messages
3. Verify image loaded successfully
4. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

### Issue 3: Image quality is poor

**Problem:** Dog photos look blurry or pixelated

**Fix:**
- Use higher resolution images (at least 200x200px)
- Use PNG format instead of JPG
- Ensure original photo is high quality

---

## 🎨 Advanced: Batch Adding Many Dogs

If you're adding **many dogs at once**, you can use this template:

**Configuration:**
```javascript
const AVAILABLE_DOGS = [
    // Original dogs
    'Leka', 'Cosmo', 'Maya', 'Rio', 'George', 'Gofret',
    'Ares', 'Tony', 'Hera',

    // Additional dogs
    'Aria', 'Cookie', 'Lolo', 'Roxy', 'Skipper',

    // NEW: Wave 1 (added Jan 2026)
    'Buddy', 'Max', 'Luna', 'Charlie', 'Bella',

    // NEW: Wave 2 (added Feb 2026)
    'Rocky', 'Daisy', 'Duke', 'Molly', 'Bear',
];
```

**Benefits:**
- Organized by when dogs were added
- Easy to track changes
- Simple to rollback if needed

---

## 💡 Pro Tips

1. **Name Consistency**: Use the same capitalization in filenames and config
2. **Photo Quality**: Higher quality photos make the game more enjoyable
3. **Backup**: Keep backups of your dog photos before editing
4. **Testing**: Test with one dog first before adding many
5. **Console**: Always check the browser console for helpful messages

---

## 🔄 Removing Dogs

To remove a dog:

1. **Option 1 - Soft Remove** (Recommended):
   - Just remove the name from [dogs-config.js](dogs-config.js)
   - Keep the photos in case you want to re-add later

2. **Option 2 - Hard Remove**:
   - Remove from [dogs-config.js](dogs-config.js)
   - Delete `photos/DogName.png`
   - Delete `photos/sleep/DogName-sleep.png`

**Note:** If someone has that dog as their favorite, it will automatically reset to "No Favorite" on their next visit.

---

## 📊 Current Configuration

Your game currently supports:
- **14 dogs** (as of initial setup)
- **9 dogs per game** (randomly selected)
- **1 favorite dog** (optional, guaranteed in every game)

**Current dogs:**
Leka, Cosmo, Maya, Rio, George, Gofret, Ares, Tony, Hera, Aria, Cookie, Lolo, Roxy, Skipper

---

## 🆘 Need Help?

If you encounter issues:

1. **Check browser console** (F12) for error messages
2. **Verify file paths** are correct
3. **Test with a simple dog name** first (like "Test")
4. **Check the image loads** by visiting `http://localhost:8000/photos/DogName.png` directly

---

**Happy dog adding!** 🐕🎉
