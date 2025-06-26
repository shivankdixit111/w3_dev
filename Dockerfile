FROM node:18-bullseye

#1. working directory
WORKDIR /app

# 2. Copy package files first
COPY package*.json ./

# 3. Install dependencies
RUN npm install

# 4. Copy app files
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]