# ==============================
# 1️⃣ Builder stage
# ==============================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first for caching
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy all source files
COPY . .

# Build TypeScript project
RUN npm run build

# ==============================
# 2️⃣ Production stage
# ==============================
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy only the build output and package files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Ensure files are readable by the non-root user
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/index.js"]
