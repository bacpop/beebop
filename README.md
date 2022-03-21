# beebop

Clone the repository to your computer with
```
git clone git@github.com:bacpop/beebop.git
```


Make sure you have [Node Package Manager](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) and [Docker](https://docs.docker.com/get-docker/) installed:
```
npm --version
docker --version
```

To start the application, run:
```
./scripts/run
```

The website can be viewed at http://localhost:8080/ . You can stop the application with `Ctrl+C`.


## Testing

You can run unit tests for the vue app with
```
npm run test:unit
```
inside `app/client/`.

The backend can be tested with 
```
npm run test
```
insinde `app/server`.
