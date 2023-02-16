
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
npm init socket-app [react | svelte | tonic | vanilla | vue]
npm create socket-app [react | svelte | tonic | vanilla | vue]

```

`Notes`  

`Templates` you can start a new app from a template by appending `[template-name]` to the creation commands above.  
  
With **yarn**:
```bash
yarn create socket-app [react | svelte | tonic | vanilla | vue]
```

With **pnpm**:
```bash
pnpm create socket-app [react | svelte | tonic | vanilla | vue]
```  

## Quick Demonstration Video


https://user-images.githubusercontent.com/79177582/219162686-649bbdb9-015a-41bd-a613-af665a5a199e.mov  


<!-- This is a draft video, I liked how they have a video tutorial in the `react` website. if it's a good idea I'll make a better one-->



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

If you have questions, please join our [Discord](https://discord.com/invite/YPV32gKCsH)
