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

# Copy necessary files from builder
COPY --from=builder /src/.next ./.next
COPY --from=builder /src/public ./public
COPY --from=builder /src/package*.json ./

# Copy next.config if it exists (using wildcard to avoid error if missing)
COPY --from=builder /src/next.config.* ./

# Install only production dependencies
RUN npm install --omit=dev

EXPOSE 3000

# Run as non-root user
USER node

CMD ["npm", "start"]
