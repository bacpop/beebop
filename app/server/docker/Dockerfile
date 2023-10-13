FROM ubuntu:jammy

RUN apt-get update \
        && apt-get install -y --no-install-recommends ca-certificates curl \
        && curl -sL https://deb.nodesource.com/setup_16.x | bash \
        && apt-get install -y git nodejs

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json
WORKDIR /app
RUN npm ci

COPY . /app
EXPOSE 4000
RUN npm run build
ENTRYPOINT ["docker/entrypoint.sh"]
