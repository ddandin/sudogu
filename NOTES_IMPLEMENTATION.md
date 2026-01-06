# Notes Feature Implementation - Remaining Steps

## Status
✅ Data structure added (this.notes, this.notesMode)
✅ Notes button added to UI (desktop + mobile)
✅ CSS styling added for notes display
✅ Notes array initialization in generateNewGame
✅ Notes button toggle functionality

## Remaining Implementation

### 1. Update renderBoard() to Display Notes
Location: Find `renderBoard()` function around line 1200

In the cell rendering section, after creating the img element, add:

```javascript
// Display notes if cell is empty
if (this.board[row][col] === 0 && this.notes[row][col].length > 0) {
    const notesContainer = document.createElement('div');
    notesContainer.className = 'cell-notes';

    this.notes[row][col].forEach(noteNum => {
        const noteImg = document.createElement('img');
        noteImg.src = this.breedImages[noteNum - 1];
        noteImg.className = 'note-img';
        noteImg.alt = '';
        notesContainer.appendChild(noteImg);
    });

    cell.appendChild(notesContainer);
}
```

### 2. Update placeDog() to Handle Notes Mode
Location: Find `placeDog(row, col, num)` function around line 1400

At the start of the function, before checking for placement, add:

```javascript
// Handle notes mode
if (this.notesMode && num !== 0) {
    const noteIndex = this.notes[row][col].indexOf(num);

    if (noteIndex > -1) {
        // Remove note if it exists
        this.notes[row][col].splice(noteIndex, 1);
    } else if (this.notes[row][col].length < 3) {
        // Add note if less than 3 notes
        this.notes[row][col].push(num);
    }

    this.renderBoard();
    return; // Exit early, don't place the dog
}
```

### 3. Clear Notes When Placing Real Dog
In the same `placeDog()` function, after setting `this.board[row][col] = num;`, add:

```javascript
// Clear notes when placing a real dog
this.notes[row][col] = [];
```

### 4. Handle Notes in Undo/Redo
Location: Find `undo()` and `redo()` functions

Update moveHistory to include notes:
```javascript
// In undo() - restore notes
if (lastMove.notes) {
    this.notes[lastMove.row][lastMove.col] = [...lastMove.notes];
}

// In placeDog() - save notes in history
this.moveHistory.push({
    row,
    col,
    previousValue,
    notes: [...this.notes[row][col]] // Save current notes
});
```

## Testing Checklist
- [ ] Click Notes button - should highlight purple
- [ ] Select a dog and click empty cell - should add mini dog image
- [ ] Click same dog again - should remove it
- [ ] Try adding 4th dog - should not add (max 3)
- [ ] Place real dog in cell with notes - should clear notes
- [ ] Turn off Notes mode - placing should work normally
- [ ] Test on both desktop and mobile

## Files Modified
- ✅ sudoku.js - Data structures and toggle function
- ✅ index.html - Notes buttons
- ✅ styles.css - Notes styling
- ⏳ sudoku.js - renderBoard(), placeDog() updates needed
