# Use Node
FROM node:22

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN timeout 30s npm install || true 
RUN npm install

# Copy the rest of the backend 
COPY . .

# Expose the port 
EXPOSE 9000

# run the application
CMD ["node", "server.js"]
