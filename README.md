# beebop

Clone the repository to your computer with
```
git clone git@github.com:bacpop/beebop.git
```

To start the Express server, go into the `app/server/` directory and run
```
npm install
npm run express
```

In a second terminal, go to `app/client/` and start the vue App:
```
npm install
npm run serve
```

The website can be viewed at http://localhost:8080/ .


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
