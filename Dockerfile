FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build Frontend
RUN npm run build

# Expose port (internal)
EXPOSE 3000

# Start Server
CMD ["node", "server.cjs"]
