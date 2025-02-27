FROM node:20

WORKDIR /app

COPY package.json yarn.lock ./

RUN corepack enable && yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "dev"]