# ==============================
# 1️⃣ Base stage - dependencies
# ==============================
FROM node:20-alpine AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# ==============================
# 2️⃣ Development stage
# ==============================
FROM base AS development

WORKDIR /app

# Copy all source files
COPY . .

# Ensure dependencies are installed
RUN npm install

EXPOSE 3001

CMD ["npm", "run", "dev"]

# ==============================
# 3️⃣ Builder stage
# ==============================
FROM base AS builder

WORKDIR /app

# Copy all source files
COPY . .

# Build TypeScript project
RUN npm run build

# ==============================
# 4️⃣ Production stage
# ==============================
FROM node:20-alpine AS production

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy only the build output and package files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Ensure files are readable by the non-root user
RUN chown -R node:node /app

# Switch to non-root user
USER node

EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]
