FROM node:20

WORKDIR /app

COPY package.json ./

RUN corepack enable && yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "dev"]