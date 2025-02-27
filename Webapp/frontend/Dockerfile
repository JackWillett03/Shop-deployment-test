# Use Node.js 22 as the base image
FROM node:22-alpine as build

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN timeout 30s npm install || true 
RUN npm install --verbose

# Copy the entire project directory
COPY . .

# Build the React application
RUN npm run build

# Use a new Node.js 22 image for serving the build
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Install 'serve' to serve the static files
RUN npm install -g serve

# Copy the build output from the previous stage
COPY --from=build /usr/src/app/build .

# Expose the port
EXPOSE 80

# Start the React app using 'serve'
CMD ["serve", "-s", ".", "-l", "80"]
