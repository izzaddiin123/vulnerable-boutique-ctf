FROM php:8.1-apache

# Install database connectors
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable full permissions on uploads directory for web shell uploads
RUN chmod -R 777 /var/www/html

# Flag file for RCE / Command Injection challenges
RUN echo "FLAG{unrestricted_php_upload_rce_achieved}" > /var/www/flag.txt

COPY . /var/www/html/
EXPOSE 80
