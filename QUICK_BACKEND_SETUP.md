# Quick Backend Setup (5 Minutes)

## TL;DR - Fast Setup

### 1. Create Google Sheet (1 min)
- Go to [sheets.google.com](https://sheets.google.com)
- New spreadsheet → Name: "Sudoku Leaderboard"
- Add headers: `Name | Difficulty | Time | Mistakes | Timestamp`

### 2. Add Apps Script (2 min)
- Extensions → Apps Script
- Paste the code from `BACKEND_SETUP_GUIDE.md` (Step 2)
- Save

### 3. Deploy (1 min)
- Deploy → New deployment → Web app
- Execute as: **Me**
- Who has access: **Anyone**
- Deploy → **Copy the URL**

### 4. Update sudoku.js (1 min)
Replace `AKfycbzYOUR_DEPLOYMENT_ID_HERE` with your actual URL in 2 places:
- Line ~1859 (submitScore method)
- Line ~1905 (getLeaderboard method)

### 5. Test
Play a game → Submit score → Check Google Sheet!

---

## Your Apps Script Code

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.name,
      data.difficulty,
      data.time,
      data.mistakes,
      data.timestamp
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Score submitted successfully'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();

    const scores = data.slice(1).map(row => ({
      name: row[0],
      difficulty: row[1],
      time: row[2],
      mistakes: row[3],
      timestamp: row[4]
    }));

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      scores: scores
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## Troubleshooting

**Scores not saving?**
- Check: Deploy settings → "Who has access" = **Anyone**
- Re-deploy if you changed the script

**Leaderboard empty?**
- Manually add test row in Google Sheet
- Check browser console (F12) for errors
- Verify both URLs are updated in sudoku.js

**CORS warnings in console?**
- Normal! Using `mode: 'no-cors'` - scores still save

---

**Done!** Your leaderboard is now global! 🎉
