#!/bin/bash
#
# Setup Test Database Script
# Creates and migrates the test database for running tests
#

set -e

echo "🔧 Setting up test database..."

# Colors for output
GREEN='\033[0.32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
  echo "${YELLOW}⚠️  PostgreSQL is not running on localhost:5432${NC}"
  echo "Please start PostgreSQL and try again"
  exit 1
fi

# Get database user from .env
DB_USER=$(grep "DATABASE_URL" .env | grep -oP '://\K[^:@]+')
if [ -z "$DB_USER" ]; then
  DB_USER="postgres"
  echo "${YELLOW}Using default user: postgres${NC}"
else
  echo "Using database user: $DB_USER"
fi

# Create test database if it doesn't exist
echo "Creating keypro_test database..."
psql -U "$DB_USER" -d postgres -c "CREATE DATABASE keypro_test;" 2>/dev/null || {
  echo "${YELLOW}Database keypro_test already exists (or error occurred)${NC}"
}

# Run migrations on test database
echo "Running migrations on test database..."
DATABASE_URL="postgresql://$DB_USER@localhost:5432/keypro_test?schema=public" npx prisma migrate deploy

echo "${GREEN}✅ Test database setup complete!${NC}"
echo ""
echo "You can now run tests with:"
echo "  npm test"
echo "  npm test -- --coverage"
