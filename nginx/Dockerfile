# Use the official Nginx Alpine image for a lightweight container
FROM nginx:1.29-alpine

# Remove default config to avoid conflicts
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy our custom nginx configuration
COPY conf.d/ /etc/nginx/conf.d/

# Copy SSL certificates
COPY certs/fullchain.pem /etc/ssl/certs/fullchain.pem
COPY certs/privkey.pem /etc/ssl/private/privkey.pem

# Create directory for private key if it doesn't exist
RUN mkdir -p /etc/ssl/private && \
    chmod 700 /etc/ssl/private && \
    chmod 600 /etc/ssl/private/privkey.pem

# Expose HTTP and HTTPS ports
EXPOSE 80 443

# Test nginx config before starting (optional but recommended)
RUN nginx -t

# Start Nginx in foreground (required for Docker)
CMD ["nginx", "-g", "daemon off;"]