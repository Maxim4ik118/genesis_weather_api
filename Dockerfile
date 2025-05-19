FROM node:18-alpine

WORKDIR /app

# Install netcat for database connection check
RUN apk add --no-cache netcat-openbsd

COPY package*.json ./
COPY prisma ./prisma/
COPY .env.prod ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

# Add a script to wait for the database and run migrations
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "start:prod"] 