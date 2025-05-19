#!/bin/sh
set -e

# Load environment variables from .env.prod
if [ -f .env.prod ]; then
    echo "Loading environment variables from .env.prod"
    set -a
    . ./.env.prod
    set +a
fi

# Wait for the database to be ready
echo "Waiting for database to be ready..."
while ! nc -z db 5432; do
  sleep 1
done
echo "Database is ready!"

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Execute the main command
exec "$@" 