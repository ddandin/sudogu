# Global Leaderboard Backend Setup Guide

## Overview

This guide will help you set up a free Google Sheets backend for the global leaderboard in your Sudoku game.

## Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it "Sudoku Leaderboard"
4. In the first row, add these headers:
   - A1: `Name`
   - B1: `Difficulty`
   - C1: `Time`
   - D1: `Mistakes`
   - E1: `Timestamp`

## Step 2: Create Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any code in the editor
3. Copy and paste the code below:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    // Add new score to sheet
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

    // Skip header row and convert to objects
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

4. Click the **Save** icon (💾) or press `Cmd+S` / `Ctrl+S`
5. Name your project "Sudoku Leaderboard API"

## Step 3: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure the deployment:
   - **Description**: "Sudoku Leaderboard v1"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
5. Click **Deploy**
6. **IMPORTANT**: Copy the **Web app URL** (it looks like: `https://script.google.com/macros/s/AKfycby...../exec`)
7. Click **Done**

## Step 4: Update Your Code

1. Open [sudoku.js](sudoku.js)
2. Find line 1859 (in `submitScore()` method)
3. Replace the placeholder URL:

**Change this:**
```javascript
const response = await fetch('https://script.google.com/macros/s/AKfycbzYOUR_DEPLOYMENT_ID_HERE/exec', {
```

**To this (with your actual URL):**
```javascript
const response = await fetch('https://script.google.com/macros/s/AKfycby_YOUR_ACTUAL_ID_HERE/exec', {
```

4. Find line 1905 (in `getLeaderboard()` method)
5. Replace the same placeholder URL:

**Change this:**
```javascript
const response = await fetch('https://script.google.com/macros/s/AKfycbzYOUR_DEPLOYMENT_ID_HERE/exec?action=getScores');
```

**To this:**
```javascript
const response = await fetch('https://script.google.com/macros/s/AKfycby_YOUR_ACTUAL_ID_HERE/exec?action=getScores');
```

## Step 5: Test the Integration

1. Open your Sudoku game in a browser
2. Complete a game
3. Submit your score with a name
4. Check your Google Sheet - you should see a new row with:
   - Your name
   - Difficulty level
   - Time (in seconds)
   - Number of mistakes
   - Timestamp
5. Open the leaderboard - it should show your score!

## Troubleshooting

### Score doesn't appear in Google Sheet

**Check:**
- Did you deploy the Apps Script as "Anyone" can access?
- Did you copy the correct Web app URL?
- Did you replace BOTH URLs in sudoku.js?
- Check browser console (F12) for error messages

**Fix:**
- Re-deploy the Apps Script
- Make sure "Who has access" is set to "Anyone"
- Try in incognito/private browsing mode

### Leaderboard shows "No scores yet"

**Check:**
- Is there data in your Google Sheet?
- Open browser console (F12) and look for errors
- Check Network tab to see if API request succeeded

**Fix:**
- Try adding a test score manually in the Google Sheet
- Verify the GET endpoint URL is correct
- Check that your sheet has the correct headers

### CORS Errors in Console

**This is normal!** The code uses `mode: 'no-cors'` for POST requests, which prevents reading the response but allows the request to go through. Your scores are still being saved.

### Multiple Versions of Scores

If you update the Apps Script, you need to create a **new deployment** (not update the existing one) for changes to take effect immediately.

## Security Notes

- ✅ **Free**: Uses Google's free tier (unlimited requests)
- ✅ **Simple**: No authentication needed
- ✅ **Safe**: Only accepts POST data, can't delete or modify existing data
- ⚠️ **Public**: Anyone with the URL can submit scores (this is expected for a game)
- ⚠️ **No validation**: Consider adding server-side validation to prevent cheating

## Optional: Prevent Cheating

Add this validation to your `doPost()` function:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    // Validation: Prevent obviously fake scores
    if (data.time < 10) {
      throw new Error('Score rejected: Too fast to be legitimate');
    }

    if (data.mistakes < 0 || data.mistakes > 1000) {
      throw new Error('Score rejected: Invalid mistakes count');
    }

    if (!['easy', 'medium', 'hard'].includes(data.difficulty)) {
      throw new Error('Score rejected: Invalid difficulty');
    }

    // Add new score to sheet
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
```

## What's Next?

Once you've set up the backend and updated the URLs:
1. Your leaderboard will be shared globally across all players
2. Scores are automatically saved to Google Sheets
3. localStorage is used as a backup if the API is unavailable
4. Players can compete on a global leaderboard!

---

**Need help?** Check the browser console (F12) for detailed error messages, or verify that your Google Sheet is receiving data correctly.
