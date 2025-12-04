FROM node:20-alpine

COPY app/client-v2/package.json /app/package.json
WORKDIR /app
RUN npm install

COPY app/client-v2 /app
ENV BUILD_TARGET=docker
RUN npm install && npm run build

FROM nginx:stable

# Clear out existing configuration
RUN rm /etc/nginx/conf.d/default.conf
RUN rm /usr/share/nginx/html -rf

VOLUME /var/log/nginx
VOLUME /run/proxy

COPY proxy/nginx.conf.template /etc/nginx/nginx.conf.template
COPY proxy/bin /usr/local/bin
COPY proxy/ssl/dhparam.pem /run/proxy/dhparam.pem

COPY --from=0 /app/dist /usr/share/nginx/html

ENTRYPOINT ["/usr/local/bin/reverse-proxy"]
