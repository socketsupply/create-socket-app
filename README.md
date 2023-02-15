
# Create Socket App 

`Create Socket App` is similar to React's `Create React App`. The idea is to provides a
few basic boilerplates and some strong opinions so you can get coding on a
production quality app as quickly as possible.

## Getting Started 

Before getting started, you may need some `Prerequisites`, to learn more you can check
[Socket Runtime](https://sockets.sh/).
**You'll also need to have Node>= 16 on your local developement machine.**
That's it, you are ready to go!

To create a new app, you may choose one of the following methods: 

With **npm**:

Any of these following commands will work
```bash
npx create socket-app [react | svelte | tonic | vanilla | vue]
npm init socket-app [react | svelte | tonic | vanilla | vue]
npm create socket-app [react | svelte | tonic | vanilla | vue]

```

`Notes` : 

`npx` is a package runner tool that comes with `npm 5.2` and above - learn more here(https://blog.npmjs.org/post/162869356040/introducing-npx-an-npm-package-runner#:~:text=npx%20is%20a%20tool%20intended%20to%20help%20round,tools%20and%20other%20executables%20hosted%20on%20the%20registry.)

`Templates`:you can start a new app from a template by appending `[template-name]` to the creation command.

<!-- I was thinking ,it will be nice to add a video tutorial or screenshoots for each command and option. -->

With **yarn**:
```bash
yarn create socket-app [react | svelte | tonic | vanilla | vue]
```

With **pnpm**:
```bash
pnpm create socket-app [react | svelte | tonic | vanilla | vue]
```

## Output:

Now inside of your directory,you should have a `directory structure` like this:

```bash
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

## Contributing 

`Create Socket app` works on macOS, Windows, and linux.
If something doesn't work, please [create an issue](https://github.com/socketsupply/create-socket-app).
We'd love to have your helping on `create-socket-app`.
If you have questions, please join our [Discord](https://discord.com/channels/775715380089716778/1062402105794625707)
