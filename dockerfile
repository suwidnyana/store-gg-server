# Base image
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json & install deps
COPY package*.json ./
RUN npm install --production

# Copy seluruh project
COPY . .

# Expose port
EXPOSE 5000

# Start app
CMD ["npm", "start"]
