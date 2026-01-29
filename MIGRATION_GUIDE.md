# Database Migration Guide: Local → Neon

This guide will help you migrate your local PostgreSQL database to Neon for production use with Vercel.

## Prerequisites

- ✓ Neon account with a project created
- ✓ Neon connection string (from your Neon dashboard)
- ✓ Local database with data (389 games, officials, etc.)
- ✓ Vercel account for deployment

## Step-by-Step Migration

### Step 1: Run Migrations on Neon

Before importing data, you need to set up the database schema on Neon.

```bash
# Temporarily set DATABASE_URL to your Neon connection string
$env:DATABASE_URL="your-neon-connection-string-here"

# Run migrations
npx prisma migrate deploy

# Unset the environment variable (return to local)
$env:DATABASE_URL=""
```

This creates all tables, indexes, and constraints on your Neon database.

### Step 2: Run the Migration Script

The migration script will copy all data from your local database to Neon.

```bash
npx tsx scripts/migrate-to-neon.ts
```

When prompted, paste your Neon connection string. The script will:
- Export all teams, officials, games, and game assignments
- Import them into Neon in the correct order
- Show progress for each table
- Verify counts match at the end

**Example output:**
```
🚀 Starting database migration...

📊 Checking source database...
  ✓ Teams: 20
  ✓ Officials: 105
  ✓ Games: 389
  ✓ Game Officials: 1556

📦 Migrating Teams...
  ✓ Created: 20, Skipped: 0

👥 Migrating Officials...
  ✓ Created: 105, Skipped: 0

🏒 Migrating Games...
  ✓ Created: 389, Skipped: 0

🎫 Migrating Game Officials...
  ✓ Created: 1556, Skipped: 0

✅ Verifying migration...
🎉 Migration completed successfully!
```

### Step 3: Verify the Migration

Run the verification script to double-check everything was migrated correctly.

```bash
npx tsx scripts/verify-migration.ts
```

When prompted, paste your Neon connection string again. The script will:
- Compare record counts between local and Neon
- Check sample data exists in both databases
- Verify season distributions match
- Display a pass/fail status

**Example output:**
```
┌─────────────────┬────────┬────────┬─────────┐
│ Table           │ Local  │ Neon   │ Status  │
├─────────────────┼────────┼────────┼─────────┤
│ Teams           │ 20     │ 20     │ ✓ Match │
│ Officials       │ 105    │ 105    │ ✓ Match │
│ Games           │ 389    │ 389    │ ✓ Match │
│ Game Officials  │ 1556   │ 1556   │ ✓ Match │
└─────────────────┴────────┴────────┴─────────┘

✅ VERIFICATION PASSED
All data has been successfully migrated to Neon!
```

### Step 4: Update Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add or update these variables:

   **DATABASE_URL**
   - Value: Your Neon connection string
   - Environment: Production, Preview, Development

   **NEXT_PUBLIC_BASE_URL**
   - Value: Your Vercel deployment URL (e.g., `https://bchl-officials-website.vercel.app`)
   - Environment: Production, Preview, Development

4. Save the changes

### Step 5: Redeploy Your Application

Trigger a new deployment to pick up the environment variable changes:

**Option A: Push to GitHub**
```bash
git add .
git commit -m "Update database to Neon"
git push
```
Vercel will automatically deploy.

**Option B: Manual Deploy**
- Go to your Vercel dashboard
- Click **Deployments** → **Redeploy**

### Step 6: Test Production Site

1. Visit your production URL
2. Verify the officials list loads correctly
3. Click on an official's name to view their profile
4. Test the season tabs (2024-25 and 2025-26)
5. Check that game counts are correct
6. Click "View Report" links to ensure external links work

### Step 7: Set Up GitHub Actions for Daily Scraping

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add a new repository secret:
   - Name: `APP_URL`
   - Value: Your Vercel production URL (e.g., `https://bchl-officials-website.vercel.app`)

The daily scraper will now run automatically at 2 AM UTC every day.

## Troubleshooting

### Migration Script Fails

**Error: "Connection refused"**
- Check your Neon connection string is correct
- Ensure your Neon database is active (not hibernated)
- Verify your IP is allowed in Neon's connection settings

**Error: "Unique constraint violation"**
- Target database already has data
- The script will skip duplicates and continue
- Check verification output to confirm all data is present

**Error: "Foreign key constraint violation"**
- This shouldn't happen as the script respects foreign key order
- If it occurs, try clearing the Neon database and re-running migrations:
  ```bash
  # Connect to Neon database
  $env:DATABASE_URL="your-neon-connection-string"

  # Reset database
  npx prisma migrate reset --skip-seed

  # Run migrations again
  npx prisma migrate deploy
  ```

### Verification Fails

If counts don't match:
1. Check the specific tables that differ
2. Re-run the migration script (it will skip existing records)
3. Check Neon dashboard for any errors or warnings

### Production Site Not Loading

**Error: "Database connection failed"**
- Verify `DATABASE_URL` is set correctly in Vercel
- Check Neon database is active
- Ensure connection pooling is enabled in `lib/prisma.ts`

**Error: "No data showing"**
- Check Vercel deployment logs for errors
- Verify migrations ran successfully on Neon
- Test the API endpoints directly: `/api/officials`, `/api/seasons`

### Daily Scraper Not Working

1. Check GitHub Actions tab for error logs
2. Verify `APP_URL` secret is set correctly
3. Test the scraper API manually:
   ```bash
   curl -X POST https://your-vercel-url.vercel.app/api/scrape \
     -H "Content-Type: application/json" \
     -d '{"action":"discover-and-save","startId":13606,"endId":13610,"batchSize":5}'
   ```

## Rollback Plan

If something goes wrong and you need to rollback:

1. **Reset Neon database:**
   ```bash
   $env:DATABASE_URL="your-neon-connection-string"
   npx prisma migrate reset --skip-seed
   npx prisma migrate deploy
   ```

2. **Re-run migration:**
   ```bash
   npx tsx scripts/migrate-to-neon.ts
   ```

3. **Update Vercel:**
   - Trigger a new deployment after fixing any issues

Your local database is never modified, so it remains your source of truth.

## Post-Migration Monitoring

### Check Neon Dashboard
- Storage usage (free tier: 3GB)
- Compute hours used (free tier: 100 hours/month)
- Active connections
- Query performance

### Check Vercel Analytics
- Response times for API routes
- Error rates
- Traffic patterns

### Monitor GitHub Actions
- Daily scraper success/failure
- Execution time
- Data added per run

## Support

If you encounter issues not covered in this guide:
1. Check Neon documentation: https://neon.tech/docs
2. Check Vercel documentation: https://vercel.com/docs
3. Review application logs in Vercel dashboard
4. Check GitHub Actions logs for scraper issues

## Summary Checklist

- [ ] Run migrations on Neon: `npx prisma migrate deploy`
- [ ] Run migration script: `npx tsx scripts/migrate-to-neon.ts`
- [ ] Verify migration: `npx tsx scripts/verify-migration.ts`
- [ ] Update Vercel environment variables (DATABASE_URL, NEXT_PUBLIC_BASE_URL)
- [ ] Redeploy application on Vercel
- [ ] Test production site thoroughly
- [ ] Set up GitHub Actions secret (APP_URL)
- [ ] Monitor first automated scrape run
- [ ] Verify daily scraping works correctly

**Estimated time:** 30-45 minutes

**Result:** Your application is now running in production with Neon database, automatic deployments via Vercel, and daily data scraping via GitHub Actions!
