# Website

## Setup

1. Install dependencies: `pnpm i`
2. Setup environment variables: `cp .env.example .env`
3. Run database setup script: `./start-database.sh`
4. Run drizzle migrations: `pnpm db:migrate`
5. (Optional) Run seed script: `pnpm db:seed`

## Documentation

### Adding new vouchers:

1. Add vendor to `vendors.ts` file
2. Add vendor translations to `messages` folder