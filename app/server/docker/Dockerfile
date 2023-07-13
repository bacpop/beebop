FROM node:16

COPY ./package.json /app/package.json
WORKDIR /app
RUN npm ci

COPY . /app
EXPOSE 4000
RUN npm run build
ENTRYPOINT ["docker/entrypoint.sh"]
