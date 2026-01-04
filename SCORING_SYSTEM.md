# Scoring System Explanation

## How the Scoring Works

The leaderboard now uses a **fair scoring system** that accounts for both **time** and **mistakes**.

### Formula
```
Total Score = Time (seconds) + (Mistakes × 30 seconds)
```

**Lower score is better!**

## Why 30 Seconds Per Mistake?

Each mistake adds a **30-second penalty** to your total score. This makes mistakes significantly impact your ranking while still allowing skilled players who make few mistakes to compete.

## Examples

### Example 1: Your Scenario
**You:**
- Time: 5:00 (300 seconds)
- Mistakes: 1
- **Total Score: 300 + (1 × 30) = 330 seconds = 5:30**
- **Rank: #1** 🥇

**Your Husband:**
- Time: 4:51 (291 seconds)
- Mistakes: 54
- **Total Score: 291 + (54 × 30) = 1,911 seconds = 31:51**
- **Rank: #2**

**Winner: You!** ✅

---

### Example 2: Close Match
**Player A:**
- Time: 3:00 (180 seconds)
- Mistakes: 2
- **Total Score: 180 + (2 × 30) = 240 seconds = 4:00**

**Player B:**
- Time: 3:30 (210 seconds)
- Mistakes: 0
- **Total Score: 210 + (0 × 30) = 210 seconds = 3:30**

**Winner: Player B** (perfect game beats faster but sloppy)

---

### Example 3: Speed vs Accuracy
**Speed Runner:**
- Time: 2:00 (120 seconds)
- Mistakes: 5
- **Total Score: 120 + (5 × 30) = 270 seconds = 4:30**

**Careful Player:**
- Time: 4:00 (240 seconds)
- Mistakes: 1
- **Total Score: 240 + (1 × 30) = 270 seconds = 4:30**

**Result: Tied!** (Both strategies equally valid)

---

## Leaderboard Display

The leaderboard now shows:

| Rank | Name | Time | Mistakes | Total Score |
|------|------|------|----------|-------------|
| 🥇 | You | 5:00 | 1 ❌ | **5:30** |
| 2 | Husband | 4:51 | 54 ❌ | 31:51 |

- **Time** - Your actual completion time
- **Mistakes** - Number of errors made
- **Total Score** - Final ranking score (Time + Penalty)

The **Total Score** column is highlighted and bold - this is what determines your rank!

---

## Strategy Tips

### For Best Scores:
1. **Minimize mistakes** - Each one costs 30 seconds!
2. **Balance speed and accuracy** - Going too fast causes mistakes
3. **Use undo wisely** - Prevents mistakes from counting
4. **Practice harder difficulties** - Better skills = fewer mistakes

### Mistake Cost Table
| Mistakes | Penalty | Equivalent Time Lost |
|----------|---------|---------------------|
| 1 | 30 sec | 0:30 |
| 2 | 60 sec | 1:00 |
| 5 | 150 sec | 2:30 |
| 10 | 300 sec | 5:00 |
| 25 | 750 sec | 12:30 |
| 50 | 1,500 sec | 25:00 |
| 54 | 1,620 sec | 27:00 |

---

## Why This System is Fair

✅ **Rewards accuracy** - Perfect games get no penalty
✅ **Allows mistakes** - 1-2 mistakes won't ruin your score
✅ **Penalizes sloppiness** - 50+ mistakes severely hurt ranking
✅ **Balances playstyles** - Fast players and careful players can both win
✅ **Clear and transparent** - Simple formula, easy to understand

---

## Adjusting the Penalty (Advanced)

If you want to change how much mistakes affect scoring, edit the penalty in [sudoku.js:1921](sudoku.js#L1921):

```javascript
calculateScore(time, mistakes) {
    return time + (mistakes * 30);  // Change 30 to adjust penalty
}
```

**Suggested values:**
- **20 seconds** - Lighter penalty (mistakes matter less)
- **30 seconds** - Balanced (current setting) ✅
- **45 seconds** - Heavier penalty (accuracy matters more)
- **60 seconds** - Very strict (near-perfect required for top scores)

---

**Enjoy the fair competition!** 🏆
