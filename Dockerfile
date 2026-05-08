FROM node:24-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN chown -R node:node /usr/src/app

USER node

EXPOSE 3000

CMD ["npm", "start"]