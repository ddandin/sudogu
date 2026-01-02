# Sudogu - Deployment Guide

Your Sudogu game is now ready to be deployed online! Here are simple steps to publish it and share with your friends.

## ✨ New Features
- 📱 **Fully Mobile Responsive**: Optimized layout for mobile devices with single-page design
- 🏆 **Leaderboard System**: Players can submit scores and compete with friends
- 🎮 **Guest Play**: No login required - just play and optionally add your name

## Option 1: Netlify (Recommended - Easiest)

1. **Create a free Netlify account**
   - Go to [https://www.netlify.com/](https://www.netlify.com/)
   - Sign up for free using GitHub, GitLab, or email

2. **Deploy your site**
   - Click "Add new site" → "Deploy manually"
   - Drag and drop your entire `/Users/dilara/Desktop/kod` folder into the upload area
   - Netlify will give you a URL like `https://random-name-12345.netlify.app`

3. **Share with friends**
   - Copy the URL and send it to your friends
   - They can play immediately without any login
   - Scores are saved locally in each player's browser

## Option 2: Vercel

1. **Create a free Vercel account**
   - Go to [https://vercel.com/](https://vercel.com/)
   - Sign up for free

2. **Deploy**
   - Install Vercel CLI: `npm install -g vercel`
   - In your kod folder, run: `vercel`
   - Follow the prompts (just press Enter for defaults)
   - You'll get a URL like `https://your-project.vercel.app`

## Option 3: GitHub Pages

1. **Create a GitHub account** (if you don't have one)
   - Go to [https://github.com/](https://github.com/)

2. **Create a new repository**
   - Click "New repository"
   - Name it `sudogu-game`
   - Make it Public
   - Don't add README, .gitignore, or license

3. **Upload your files**
   - Click "uploading an existing file"
   - Drag all files from your kod folder
   - Commit the files

4. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Under "Source", select "main" branch
   - Click Save
   - Your site will be at `https://YOUR_USERNAME.github.io/sudogu-game`

## How the Leaderboard Works

- Scores are saved in each player's browser using localStorage
- This means each player will only see their own scores
- If you want a shared leaderboard across all players, you would need a backend service (more complex setup)

## What Your Friends Need to Do

1. Click the link you send them
2. Play the game
3. When they complete a puzzle, they can enter their name (or stay as "Anonymous")
4. Click "Submit Score" to save to their leaderboard
5. Click the "Leaderboard" button to see their top scores by difficulty

## Customizing Your Domain (Optional)

After deploying to Netlify or Vercel:
- You can change the random URL to something custom for free
- Example: `sudogu-game.netlify.app` instead of `random-name-12345.netlify.app`
- Or buy a custom domain like `sudogu.com` (costs money)

## Troubleshooting

**Game doesn't load images:**
- Make sure the `photos` folder is uploaded with all dog images

**Leaderboard doesn't show scores:**
- Scores are saved per browser, so clearing browser data will reset them
- Each player's scores are independent

## Need Help?

If you run into any issues, the deployment platforms (Netlify, Vercel, GitHub) all have detailed documentation and support.

Enjoy sharing your game with friends! 🐾
