FROM nginx:alpine

# Copy all static files to nginx's default public directory
COPY . /usr/share/nginx/html/

# Expose port 80
EXPOSE 80
