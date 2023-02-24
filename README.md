
# Create Socket App 

`Create Socket App` is similar to React's `Create React App`, it will help you build native apps for mobile and desktop with Svelte, Reactjs, Vuejs and others!  
The idea is to provides a few basic boilerplates and some strong opinions so you can get coding on a production quality app as quickly as possible.  

## Set up your Socket environement  

You can find more details about prerequisites, instructions, and many useful tips in [Socket Runtime](https://sockets.sh/) documentation.

## Quick Overview  

```bash
$npx create-socket-app -h

usage: create-socket-app [react | svelte | tonic | vanilla | vue]  

```
```
$npx create-socket-app

Creating socket files...OK
Initializing npm package...OK
Installing dependencies...OK
Adding package scripts...OK
Updating project configuration...OK
Copying project boilerplate...OK

Type 'npm start' to launch the app

```  

## Getting Started 

**You’ll need to have Node 16.0.0 or later version on your local development machine .**  

Creat an empty directory and that's it, you are ready to go!

You may choose one of the following methods: 

### **npm**

Any of these following commands will work
```bash
npm init socket-app [react | svelte | tonic | vanilla | vue]
npm create socket-app [react | svelte | tonic | vanilla | vue]

```
  
### **yarn**
```bash
yarn create socket-app [react | svelte | tonic | vanilla | vue]
```

### **pnpm**
```bash
pnpm create socket-app [react | svelte | tonic | vanilla | vue]
```  
![cmd](https://user-images.githubusercontent.com/79177582/221211905-4a774811-d0ba-45f5-9518-e8e6791461d5.jpg)

## Quick Demonstration Video


https://user-images.githubusercontent.com/79177582/219162686-649bbdb9-015a-41bd-a613-af665a5a199e.mov  


<!-- This is a draft video, I liked how they have a video tutorial in the `react native` website. if it's a good idea I'll make a better one-->


## Output:

Now inside of your directory, you should have a `directory structure` like this:

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

`Create Socket app` works on : macOS, Windows, and linux.  

If something doesn't work, please [Create an issue](https://github.com/socketsupply/create-socket-app). We'd love to have your helping on `Create Socket App`.  
  
If you have questions, please join our [Discord](https://discord.com/invite/YPV32gKCsH)
