# beebop

## Docker Quick Start

Run the dockerised app along with proxy and all dependencies:

```
    ./scripts/run_docker_decrypt
```

You may need to update your version of Docker and Docker Compose: see [here](https://docs.docker.com/engine/install/ubuntu/) for instructions on updating on Ubuntu. 

By default this will configure the nginx proxy for host localhost. To deploy with a different hostname, pass it as an argument, e.g.
```
./scripts/run_docker_decrypt beebop.dide.ic.ac.uk
```

This will also populate app config with secrets from the vault. If you are not running the script for the first time,
or not for the first time since running the app outside docker, you can omit this step by running the `run_docker` script.

Bring down the app with
```
    ./scripts/stop_docker
```

Docker images are built on CI using `./proxy/docker/build`, `./app/server/docker/build`. If you want
to generate them from changed local sources you can run those same scripts locally to build images.

To target a branch of `beebop_py`, set `API_IMAGE` in `scripts/common`.

When running locally in docker, the backend is serving from `beebop_beebop-server_1`, and the front end from the proxy
container `beebop_proxy_1`.

## Local development

Clone the repository to your computer with
```
git clone git@github.com:bacpop/beebop.git
```


Make sure you have [Node Package Manager](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) and [Docker](https://docs.docker.com/get-docker/) installed:
```
npm --version
docker --version
```


If you run the application for the first time (or for the first time after running in docker), you need to replace the 
secrets in the config file in `app/server/src/resources` first. 
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

The website can be viewed at http://localhost:5173/ . You can stop the application with `./scripts/stop_test`.

The `run_test` script uses [pm2](https://github.com/Unitech/pm2) to manage running the client and server applications.

To see logs, use `pm2 logs` (append `beebop_server` or `beebop_client` to show logs for one application only).
To reload an application after making code changes, use `pm2 reload beebop_server` or `pm2 reload beebop_client`.
To see fuller monitoring dashboard, use `pm2 monit`.

You can also run everything outside pm2, by separately running:
- `./scripts/run_dev_dependencies`
- `./scripts/run_server`
- `./scripts/run_client`

*Note: If you wish to override the volune with a custom bind mount pass in -mount {MOUNT_NAME} into `run_test` script*

## Config
Config for the front-end lives in `./app/client/src/settings` and by default webpack (via the vue-cli) will use the config 
defined in `./app/client/src/settings/development`; this gets overriden by setting an env var called `BUILD_TARGET` - see `./proxy/Dockerfile`.

Config for the back-end lives in `./app/server/src/resources`. When deploying using a docker image this file has to be 
copied into the running container before the app will start - see `./app/server/docker/entrypoint.sh`.

## Deploying with docker

Docker images are built on CI using `./proxy/docker/build`, `./app/server/docker/build`. If you want 
to generate them from changed local sources you can run those same scripts locally to build images. 

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
    ./scripts/run_docker beebop.dide.ic.ac.uk
```

Bring down the app with
```
    ./scripts/stop_docker
```

### Self-signed certificate
For testing it is useful to use a self-signed certificate. These are not in any way secure.
There is a self-signed certificate in the repo for use in testing situations. It was generated by running (on metal):

```
./bin/self-signed-certificate ssl GB London "Imperial College" reside beebop.dide.ic.ac.uk
```

Auth will not work at this point unless there are configured oauth apps that match the deployed urls.
In general the approach to getting secrets into the config could use some iteration and we should probably have a way to skip auth 
based on a config flag.

### Example fasta files

[can be found in the Knowledge Base article]([url](https://mrc-ide.myjetbrains.com/youtrack/articles/bacpop-A-1/beebop))

## Testing
### Frontend tests

You can run unit tests for the vue app with
```
npm run test:unit
```
inside `app/client/`.

### Backend tests

The backend can be tested in watch mode with 
```
npm run test:dev
```
from `app/server`.

### End-to-end tests
To run end-to-end test, the app must be started with `./scripts/run_test` from the root of the repo.

You'll need to have the playwright dependencies installed. You can install them with
```
npx playwright install-deps
```

In a new terminal, these tests can be launched with
```
npx playwright test
```
from `app/client-v2/`.
To close all components once ready, run `./scripts/stop_test` from root.

### Adding new species

1. Add new database to [mrcdata](https://mrcdata.dide.ic.ac.uk/beebop).
2. Add new species to `args.json` in *beebop_py*
