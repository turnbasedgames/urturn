FROM node:16

# Create and change to the app directory.
WORKDIR /usr/src/app

# Setup dependencies, and allow easy layer caching by only copying package*.json
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Run the web service on container startup.
CMD ["npm", "start"]
