FROM nginx:1.29-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy your nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Cloudflare origin certs (you need to put them in ./nginx/certs/)
COPY certs/fullchain.pem /etc/ssl/certs/fullchain.pem
COPY certs/privkey.pem /etc/ssl/private/privkey.pem

# Expose HTTP and HTTPS
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
