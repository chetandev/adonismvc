# Build AdonisJS
FROM node:14-alpine as builder
# Workaround for now, since bodyparser install relies on Git
RUN apk add --no-cache git
RUN apk add g++ make python
# Set directory for all files
WORKDIR /home/node
# Copy over package.json files
COPY package*.json ./
# Install all packages
RUN npm install

# Copy over source code
COPY . .
# Build AdonisJS for production
RUN npm run build --production
COPY .env ./build


# Install packages on different step,
# since bodyparser install requires git
# but runtime does not need it
FROM node:14-alpine as installer
# Workaround
RUN apk add --no-cache git
RUN apk add g++ make python

# Set directory for all files
WORKDIR /home/node
# Copy over package.json files
COPY package*.json ./
# Install only prod packages
RUN npm ci --only=production
RUN npm install  pino-pretty



# Build final runtime container
FROM node:14-alpine
# Set environment variables
# ENV NODE_ENV=production
# # Disable .env file loading
# ENV HOST=0.0.0.0
# ENV PORT=3333
# ENV ENV_SILENT=true
# # Set app key at start time
# ENV APP_KEY=
# Install deps required for this project
RUN apk add --no-cache ffmpeg

# Use non-root user
USER node
# Make directory for app to live in
# It's important to set user first or owner will be root
RUN mkdir -p /home/node/app/
# Set working directory
WORKDIR /home/node/app
# Copy over required files from previous steps
# Copy over built files
COPY --from=builder /home/node/build ./build
# Copy over node_modules
COPY --from=installer /home/node/node_modules ./node_modules
# Copy over package.json files
COPY package*.json ./
# Expose port 3333 to outside world
EXPOSE 3333
# Start server up
CMD [ "node", "./build/server.js" ]