FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY ./server/package*.json ./
RUN npm install --only=production

# Copy server source and pre-built React app
COPY ./server .

# Create lancedb directory for vector database
RUN mkdir -p lancedb

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]