FROM node:alpine

# Install Python, make, and build dependencies (required for prisma)
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  bash \
  curl

WORKDIR /app

COPY package*.json ./

# Install the app dependencies
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
