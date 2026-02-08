# Base stage - install dependencies
FROM node:20-alpine AS base

WORKDIR /src

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Development stage
FROM base AS development

WORKDIR /src

# Copy all source files except node_modules (handled by .dockerignore)
COPY . .

# Ensure node_modules from base stage is preserved
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Production build stage
FROM base AS builder

# Build argument for API URL (required for Next.js build)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /src

# Copy all source files
COPY . .

# Create public folder if it doesn't exist (for Next.js)
RUN mkdir -p public

# Reinstall to ensure all dependencies are present
RUN npm install

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /src

# Install curl and dumb-init for health checks and proper signal handling
RUN apk add --no-cache curl dumb-init

# Install Chromium and dependencies for Puppeteer (BEFORE copying files)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Puppeteer to skip installing Chrome and use the installed package
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy necessary files from builder
COPY --from=builder /src/.next ./.next
COPY --from=builder /src/public ./public
COPY --from=builder /src/package*.json ./

# Copy next.config if it exists (using wildcard to avoid error if missing)
COPY --from=builder /src/next.config.* ./

# Install only production dependencies
RUN npm install --omit=dev

# Change ownership to node user (IMPORTANT: Do this AFTER installing packages)
RUN chown -R node:node /src

EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Run as non-root user
USER node

# Use dumb-init to handle signals properly (prevents zombie processes)
ENTRYPOINT ["dumb-init", "--"]

# Start Next.js
CMD ["npm", "start"]