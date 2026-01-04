# How to Add New Dogs

## Adding a New Dog (2 Steps)

### Step 1: Add Photos

Add two photos for your new dog:

```
photos/DogName.png
photos/sleep/DogName-sleep.png
```

**Example:**
```
photos/Buddy.png
photos/sleep/Buddy-sleep.png
```

**Rules:**
- Use PNG format
- Dog name = filename (without .png)
- Names are case-sensitive
- No spaces in filenames

---

### Step 2: Edit sudoku.js

Open [sudoku.js](sudoku.js) and find the `loadAllDogs()` method (around line 89).

Add your dog's name to the array:

**Before:**
```javascript
const dogNames = [
    'Alan', 'Ares', 'Aria', 'Cookie', 'George', 'Gofret',
    'Hera', 'Kozmo', 'Leka', 'Lolo', 'Maya', 'Rio',
    'Roxy', 'Skipper', 'Tony', 'Vera'
];
```

**After:**
```javascript
const dogNames = [
    'Alan', 'Ares', 'Aria', 'Cookie', 'George', 'Gofret',
    'Hera', 'Kozmo', 'Leka', 'Lolo', 'Maya', 'Rio',
    'Roxy', 'Skipper', 'Tony', 'Vera',
    'Buddy'  // ← Add your new dog here
];
```

---

### Step 3: Refresh Browser

Refresh your browser and your new dog will appear!

---

## Current Dogs (15 total)

Ares, Aria, Cookie, George, Gofret, Hera, Kozmo, Leka, Lolo, Maya, Rio, Roxy, Skipper, Tony, Vera

---

## Removing a Dog

1. Delete the photos from `photos/` and `photos/sleep/`
2. Remove the dog name from the array in [sudoku.js](sudoku.js)
3. Refresh browser

---

## Renaming a Dog

1. Rename the photo files
2. Update the name in the array in [sudoku.js](sudoku.js)
3. Refresh browser

**Note:** Players who had the old dog as favorite will need to reselect!
