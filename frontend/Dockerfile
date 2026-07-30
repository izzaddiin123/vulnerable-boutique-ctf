FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# Bind Vite explicitly to 0.0.0.0 so Nginx can reach it
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
