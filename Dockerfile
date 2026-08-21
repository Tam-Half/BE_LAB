FROM node:24-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=test

COPY package*.json ./

# Đổi từ npm ci sang npm install
RUN npm install --omit=dev

COPY . .

RUN chown -R node:node /usr/src/app

USER node

EXPOSE 3000

CMD ["npm", "start"]