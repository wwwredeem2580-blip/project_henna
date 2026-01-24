# Base stage - install dependencies
FROM node:20-alpine AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Development stage
FROM base AS development

WORKDIR /app

# Copy all source files
COPY . .

# Ensure dependencies are installed
RUN npm install

EXPOSE 3001

CMD ["npm", "run", "dev"]

# Production build stage
FROM base AS builder

WORKDIR /app

# Copy all source files
COPY . .

# Reinstall to ensure all dependencies are present
RUN npm install

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

EXPOSE 3001

# Run as non-root user
USER node

CMD ["npm", "start"]
