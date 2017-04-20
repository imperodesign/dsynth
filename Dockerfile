# Set the base image to the official Node.js one
FROM node:4.2.4

# File Author / Maintainer
MAINTAINER Jacopo Daeli

# Install npm modules
COPY package.json /src/package.json
RUN cd /src; npm install

# Bundle app source
COPY . /src

# Change working directory
WORKDIR /src

CMD ["node", "server.js"]
