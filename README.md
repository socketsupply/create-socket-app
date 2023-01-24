This is similar to React's `Create React App`. The idea is that it provides a
few basic boilerplates and some stong opinions so you can get coding on a
production quality app as quickly as possible.

```bash
$npx create-socket-app -h

usage: create-socket-app [react | svelt | tonic | vanilla | vue]
```

```bash
$npx init socket-app vanilla

Creating socket files...OK
Initializing npm package...OK
Installing dependencies...OK
Adding package scripts...OK
Updating project configuration...OK
Copying project boilerplate...OK

Type 'npm start' to launch the app

$tree
.
├── README.md
├── build.js
├── package.json
├── socket.ini
├── src
│   ├── icon.png
│   ├── index.css
│   ├── index.html
│   └── index.js
└── test
    ├── index.js
    └── test-context.js
```
