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


If you run the application for the first time, you need to replace the secrets in the config file in `app/server/src/resources` first. 
Login to the vault:
```
export VAULT_ADDR=https://vault.dide.ic.ac.uk:8200
vault login -method=github
```
Then run:
```
./scripts/decrypt_config
```


To start all required components, run:
```
./scripts/run_test
```

The website can be viewed at http://localhost:8080/ . You can stop the application with `./scripts/stop_test`.

## Deploying with docker

Make sure that all docker images exist (`./proxy/docker/build`, `./app/server/docker/build`).

Generate the correct server config file with
```
    ./scripts/decrypt_config docker
```

Then run the dockerised app with

```
    ./scripts/run_docker
```

By default this will configure the nginx proxy for host `localhost`. To deploy with a different hostname, pass
it as an argument, e.g. 

```
    ./scripts/run_docker bacpop.dide.ic.ac.uk
```

Auth will not work at this point because the oauth app is configured for the local dev addresses. 
In general the approach to getting secrets into the config could use some iteration and we should probably have a way to skip auth 
based on a config flag.

## Testing
### Frontend tests

You can run unit tests for the vue app with
```
npm run test:unit
```
inside `app/client/`.

### Backend tests

The backend can be tested with 
```
npm run test
```
insinde `app/server`.

### End-to-end tests
To run end-to-end test, the app must be started with `./scripts/run_test`. In a new terminal, these test can be launched with
```
npx playwright test
```
from `app/client/`.
To close all components once ready, run `./scripts/stop_test` from root.
