FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM alpine:3.20

WORKDIR /app

# Copy package files
COPY package*.json ./

RUN apk add --no-cache nodejs npm

# Install production dependencies only
RUN npm install --force --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose the port your app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start:prod"]