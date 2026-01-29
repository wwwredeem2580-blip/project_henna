# Use the official Nginx Alpine image for a lightweight container
FROM nginx:1.29-alpine

# Remove default config (optional, to avoid conflicts)
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy our custom configuration
COPY conf.d/ /etc/nginx/conf.d/

# Copy SSL certificates if you want to manage them inside the container
# (Otherwise Cloudflare SSL can handle HTTPS)
# COPY ssl/ /etc/ssl/certs/

# Expose ports
EXPOSE 80 443

# Start Nginx in foreground (required for Docker)
CMD ["nginx", "-g", "daemon off;"]
