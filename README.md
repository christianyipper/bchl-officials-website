# BCHL Officials Tracker

A Next.js web application that scrapes and displays BCHL (British Columbia Hockey League) game reports from HockeyTech, tracking officials and their game assignments.

## Features

- Scrape game reports from HockeyTech's BCHL game reports
- Track referees and linespeople across multiple games
- View individual official statistics and game history
- Browse all games with official assignments
- Automatic game ID discovery
- PostgreSQL database with Prisma ORM
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Scraping**: Cheerio, Axios
- **Infrastructure**: Docker for local development

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for local database)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd bchl-officials-website
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the PostgreSQL database

```bash
docker-compose up -d
```

This will start a PostgreSQL container on port 5432.

### 4. Set up the database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

### 5. Start the development server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Database Schema

### Models

- **Team**: BCHL teams
- **Official**: Referees and linespeople
- **Game**: Game information (date, location, teams)
- **GameOfficial**: Junction table linking games to officials with their role

## Using the Scraper

The scraper can be triggered via API endpoints:

### Discover valid game IDs

```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "action": "discover",
    "startId": 13800,
    "endId": 13900,
    "concurrency": 5
  }'
```

### Scrape and save games to database

```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "action": "scrape-and-save",
    "gameIds": [13872, 13873, 13874]
  }'
```

### Discover and save in one step

```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "action": "discover-and-save",
    "startId": 13800,
    "endId": 13900,
    "concurrency": 5
  }'
```

## API Endpoints

### GET /api/officials

Returns a list of all officials with game counts.

**Response:**
```json
[
  {
    "id": "clx...",
    "name": "Tyler Pang",
    "totalGames": 25,
    "refereeGames": 25,
    "linespersonGames": 0
  }
]
```

### GET /api/officials/[id]

Returns detailed information about a specific official, including all their games.

### GET /api/games

Returns a list of all games with officials.

### POST /api/scrape

Scraper API with multiple actions:
- `scrape-single`: Scrape a single game
- `discover`: Find valid game IDs in a range
- `scrape-and-save`: Scrape and save specific game IDs
- `discover-and-save`: Discover and save games in one step

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── games/
│   │   │   └── route.ts          # Games API endpoint
│   │   ├── officials/
│   │   │   ├── [id]/
│   │   │   │   └── route.ts      # Single official API
│   │   │   └── route.ts          # Officials list API
│   │   └── scrape/
│   │       └── route.ts          # Scraper API
│   ├── games/
│   │   └── page.tsx              # Games listing page
│   ├── officials/
│   │   └── [id]/
│   │       └── page.tsx          # Official detail page
│   └── page.tsx                  # Home page (Officials list)
├── lib/
│   ├── prisma.ts                 # Prisma client instance
│   └── scraper/
│       ├── types.ts              # TypeScript types
│       ├── scraper.ts            # Core scraping logic
│       ├── game-id-discovery.ts  # Game ID discovery
│       └── save-to-db.ts         # Database save logic
├── prisma/
│   └── schema.prisma             # Database schema
├── docker-compose.yml            # PostgreSQL container
└── package.json
```

## Prisma Commands

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name description

# View your database in Prisma Studio
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

## Environment Variables

The `.env` file contains:

```env
DATABASE_URL="postgresql://bchl:bchl_password@localhost:5432/bchl_officials?schema=public"
```

For production, set `NEXT_PUBLIC_BASE_URL` to your deployment URL.

## Development Tips

1. Use Prisma Studio to view and edit database contents:
   ```bash
   npx prisma studio
   ```

2. The scraper respects rate limits - adjust `concurrency` parameter to control request speed

3. Game IDs are sequential but may have gaps - use the discovery feature to find valid IDs

4. All dates are stored in UTC in the database

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions with automated daily scraping.

### Quick Start

1. **Database**: Deploy PostgreSQL to Neon, Supabase, or Railway
2. **Application**: Deploy to Vercel, Netlify, or Railway
3. **Environment Variables**:
   - `DATABASE_URL`: Your production database URL
   - `NEXT_PUBLIC_BASE_URL`: Your deployment URL
4. **GitHub Actions**: Set `APP_URL` secret in GitHub repository settings

### Automated Daily Scraping

The project includes a GitHub Actions workflow that automatically scrapes new games daily:

- Location: `.github/workflows/daily-scrape.yml`
- Schedule: Runs at 2 AM UTC daily (configurable)
- Manual trigger: Available from GitHub Actions tab
- Game ID range: 13606-20000 (configurable)

**Setup:**
1. Deploy your app to the cloud
2. Add `APP_URL` secret in GitHub repository settings
3. The workflow will run automatically each day

**Manual trigger:**
```bash
# From GitHub repository > Actions tab > Daily BCHL Game Scraper > Run workflow
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
