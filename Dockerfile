FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN yarn

COPY . .

ENV MONGODB_CLUSTER_PASS=demonterror187
ENV JWT_SECRET=neonaiserver12345678

ENV PORT=3002

EXPOSE 3002

CMD [ "yarn", "start" ]