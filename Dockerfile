FROM node:lts-alpine

WORKDIR /app

RUN apk update && apk add curl
RUN apk add npm
RUN echo "Node has version =>: " && node -v
RUN echo "NPM has version =>: " && npm -v

COPY package*.json ./

COPY client/package*.json client/
RUN npm run install-client --omit=dev

COPY server/package*.json server/
RUN npm run install-server --omit=dev

COPY client/ client/
RUN npm run build --prefix client

COPY server/ server/
COPY server/.env server/.env

USER node

EXPOSE 8000

CMD npm start --prefix server