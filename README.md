# Weather Subscription Service

A NestJS-based weather subscription service that allows users to subscribe to weather updates for specific cities. The service sends regular weather updates via email and provides a RESTful API for managing subscriptions.

## Features

- Weather data retrieval from external API
- Email subscription management
- Email notifications with weather updates
- RESTful API endpoints
- PostgreSQL database with Prisma ORM
- Automated testing with Jest
- Swagger API documentation

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- bun, npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd genesis_weather_api
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.dev
```
Edit the `.env.dev`, `.env.prod` file with your configuration values.

4. Set up the database:
```bash
bun run migrate:dev
```
4.1 (optional)To see the UI of the database:
```bash
bun run studio:dev
```

5. Start the application:
```bash
# Development
bun run start:dev

# Production
bun run build
bun run start:prod
```

## Docker Deployment

1. Build the Docker image:
```bash
docker build -t weather-subscription-service .
```

2. Run the container:
```bash
docker run -d \
  --name weather-service \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://postgres:postgres@db:5432/weather_db \
  -e WEATHER_API_KEY=your_weather_api_key \
  -e SMTP_HOST=smtp.gmail.com \
  -e SMTP_PORT=587 \
  -e SMTP_USER=your_email@gmail.com \
  -e SMTP_PASS=your_app_specific_password \
  weather-subscription-service
```

3. Using Docker Compose (recommended):
```bash
docker-compose up -d
```

The `docker-compose.yml` file includes both the application and PostgreSQL database services. Make sure to set up your environment variables in the `.env` file before running Docker Compose.

## Environment Variables

Create a `.env` file based on `.env.example` with the following variables:

```env
# Application
NODE_ENV=development
APP_PORT=3000
BASE_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/weather_db

# Weather API
WEATHER_API_KEY=your_weather_api_key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
```

## API Documentation

Once the application is running, you can access the Swagger API documentation at:
```
http://localhost:3000/doc
```

## Frontend

The project includes a simple frontend interface that can be viewed directly in your browser. To view the frontend:

1. Make sure the backend API is running (either through Docker or locally)
2. Open the `index.html` file located in the project root directory in your web browser
   - You can do this by double-clicking the file
   - Or by dragging the file into your browser window
   - Or by using the browser's "Open File" option (Ctrl+O or Cmd+O)

The frontend provides a user-friendly interface for:
- Subscribing to weather updates
- Viewing current weather information
- Managing your subscriptions
- Confirming and unsubscribing from email notifications

Note: The frontend requires the backend API to be running on `http://localhost:3000` to function properly.

## Available Scripts

- `bun run start:dev` - Start development server with hot-reload
- `bun run build` - Build the application
- `bun run start:prod` - Start production server
- `bun run test` - Run unit tests
- `bun run test:e2e` - Run end-to-end tests
- `bun run test:cov` - Run test coverage
- `bun run lint` - Run linting

## Project Structure

```
genesis_weather_api/
├── src/
│   ├── email/              # Email service module
│   ├── prisma/             # Database configuration
│   ├── scheduler/          # Weather update scheduler
│   ├── subscription/       # Subscription management
│   ├── weather/           # Weather data service
│   ├── app.module.ts      # Main application module
│   └── main.ts            # Application entry point
├── test/                  # Test files
│   ├── e2e/              # End-to-end tests
│   └── setup.ts          # Test configuration
├── prisma/               # Prisma configuration
│   ├── migrations/       # Database migrations
└── └── schema.prisma     # Database schema
```

## Testing

The project includes both unit tests and end-to-end tests. To run the tests:

```bash
# Run unit tests
bun run test

# Run e2e tests
bun run test:e2e

# Run test coverage
bun run test:cov
```

For e2e tests, make sure you have a test database configured in your `.env` file with the following settings:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/weather_test
```

## API Endpoints

### Weather
- `GET /api/weather?city={city}` - Get current weather for a city

### Subscription
- `POST /api/subscribe` - Create a new subscription
- `GET /api/confirm/:token` - Confirm subscription
- `GET /api/unsubscribe/:token` - Unsubscribe from updates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add some new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request