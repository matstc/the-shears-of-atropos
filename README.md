# Todos

- test ties
- Add better AI (and setting?)
- not enough space on mobile for 25/36
- able to cut multiple strings in one cut on mobile
- title screen could look better ~414px wide
- fix select sounds

![](screenshot.png)

# Folder structure

- `src` - source code for your kaplay project
- `dist` - distribution folder, contains your index.html, built js bundle and static assets


## Development

```sh
$ npm run dev
```

will start a dev server at http://localhost:8000

## Distribution

```sh
$ npm run build
```

will build your js files into `dist/`

```sh
$ npm run zip
```

will build your game and package into a .zip file, you can upload to your server or itch.io / newground etc.
