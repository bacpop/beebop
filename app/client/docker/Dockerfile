FROM node:16

COPY ./package.json /app/package.json
WORKDIR /app
RUN npm install

COPY . /app
RUN npm install && npm run build && npm install serve

EXPOSE 8080
CMD npx serve -n -p 8080 -s dist
