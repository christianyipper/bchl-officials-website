# Deployment Guide

This guide will help you deploy the BCHL Officials Website to the cloud with automated daily scraping.

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Neon account (free tier works) - for PostgreSQL database

## Step 1: Set Up Cloud Database (Neon)

1. Go to [neon.tech](https://neon.tech) and sign up/login
2. Create a new project named "bchl-officials"
3. Copy the connection string (starts with `postgresql://...`)
4. Keep this handy - you'll need it for Vercel

## Step 2: Deploy to Vercel

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Add GitHub Actions workflow"
   git push origin main
   ```

2. Go to [vercel.com](https://vercel.com) and sign up/login

3. Click "Add New Project" and import your GitHub repository

4. Configure your project:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: .next (default)

5. Add environment variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon connection string from Step 1
   - **Name**: `NEXT_PUBLIC_BASE_URL`
   - **Value**: Leave empty for now (will add after deployment)

6. Click "Deploy"

7. Once deployed, copy your deployment URL (e.g., `https://bchl-officials.vercel.app`)

8. Go back to Vercel Project Settings > Environment Variables
   - Edit `NEXT_PUBLIC_BASE_URL` and set it to your deployment URL

9. Redeploy the application

## Step 3: Initialize Database on Neon

1. Once your app is deployed, run the migration:
   ```bash
   # Update your .env file to point to Neon database temporarily
   DATABASE_URL="your-neon-connection-string"

   # Run Prisma migration
   npx prisma migrate deploy
   ```

2. Or use Vercel CLI to run it on the deployed environment:
   ```bash
   npm i -g vercel
   vercel login
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

## Step 4: Initial Data Population

1. Once your app is deployed, trigger the scraper manually:
   ```bash
   curl -X POST https://your-app.vercel.app/api/scrape \
     -H "Content-Type: application/json" \
     -d '{
       "action": "discover-and-save",
       "startId": 13606,
       "endId": 15000,
       "batchSize": 10
     }'
   ```

2. Or visit your deployed site and use the browser console:
   ```javascript
   fetch('/api/scrape', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       action: 'discover-and-save',
       startId: 13606,
       endId: 15000,
       batchSize: 10
     })
   }).then(r => r.json()).then(console.log)
   ```

## Step 5: Set Up GitHub Actions

1. Go to your GitHub repository > Settings > Secrets and variables > Actions

2. Click "New repository secret" and add:
   - **Name**: `APP_URL`
   - **Value**: Your Vercel deployment URL (e.g., `https://bchl-officials.vercel.app`)

3. The workflow is already in `.github/workflows/daily-scrape.yml` and will:
   - Run every day at 2 AM UTC
   - Scrape game IDs from 13606 to 20000
   - Save new games to your database

## Step 6: Test GitHub Action

1. Go to your GitHub repository > Actions tab

2. Click on "Daily BCHL Game Scraper" workflow

3. Click "Run workflow" to test it manually

4. Check the logs to confirm it works

## Customization

### Change Schedule

Edit `.github/workflows/daily-scrape.yml`:
```yaml
schedule:
  - cron: '0 2 * * *'  # 2 AM UTC daily
  # Examples:
  # - cron: '0 */6 * * *'  # Every 6 hours
  # - cron: '0 0 * * 0'    # Weekly on Sunday
```

### Adjust Game ID Range

Edit the workflow file to change `startId` and `endId`:
```yaml
-d '{
  "action": "discover-and-save",
  "startId": 13606,
  "endId": 25000,     # Increase as seasons progress
  "batchSize": 10
}'
```

### Add Notifications

To get notified on failures, you can add Slack/Discord/Email notifications to the workflow.

## Monitoring

- **Vercel Dashboard**: Monitor deployments and function logs
- **GitHub Actions**: Check workflow runs and logs
- **Neon Dashboard**: Monitor database usage and queries

## Cost Estimate

All services have generous free tiers that should handle this use case:

- **Vercel**: Free tier (100GB bandwidth, unlimited requests)
- **Neon**: Free tier (3GB storage, 100 hours compute/month)
- **GitHub Actions**: 2000 minutes/month free

Your daily scraping should take less than 5 minutes per run, well within free limits.
