FROM node:20-alpine

COPY app/client-v2/package.json /app/package.json
WORKDIR /app
RUN npm install

COPY app/client-v2 /app
ENV BUILD_TARGET docker
RUN npm install && npm run build

RUN npm install -g serve 
EXPOSE 3000
CMD ["serve", "-s", "dist"]

