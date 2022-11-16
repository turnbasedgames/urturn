FROM node:16

# set env variable
ENV NODE_ENV=production

# Create and change to the app directory.
WORKDIR /usr/src/app
RUN npm i -g npm@9

# Bundle app source
COPY . .
RUN npm i

# Run the web service on container startup.
CMD ["node", "services/server/index.js"]
