// ============================================
// DOG CONFIGURATION FILE
// ============================================
//
// HOW TO ADD NEW DOGS:
// 1. Add the dog's photos to the folders:
//    - photos/DogName.png (regular photo)
//    - photos/sleep/DogName-sleep.png (sleeping photo)
//
// 2. Add the dog's name to the array below (case-sensitive!)
//
// 3. Refresh the page - your new dog will automatically:
//    - Appear in the game
//    - Be added to the favorite dog dropdown
//    - Be available for random selection
//
// IMPORTANT: Dog names must match the filename exactly!
// Example: If file is "photos/Buddy.png", add "Buddy" to the list
//
// ============================================

const AVAILABLE_DOGS = [
    // Original dogs
    'Leka',
    'Kozmo',
    'Maya',
    'Rio',
    'George',
    'Gofret',
    'Ares',
    'Tony',
    'Hera',

    // Additional dogs
    'Aria',
    'Cookie',
    'Lolo',
    'Roxy',
    'Skipper',
    'Vera',

    // ADD NEW DOGS BELOW THIS LINE:
];

// Export for use in sudoku.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AVAILABLE_DOGS;
}
