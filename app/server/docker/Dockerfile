FROM node:20

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json
WORKDIR /app
RUN npm ci

COPY . /app
EXPOSE 4000
RUN npm run build
RUN npm install -g ts-node
ENTRYPOINT ["ts-node", "--transpile-only", "src/index.ts"]
