# HTML Text

This (very rough) demo shows how you can use SVGs to render HTML text. I saw this technique used in [pixi.js](https://github.com/pixijs/html-text) and wondered if it could be applied in Lightning.

### Getting started

> Before you follow the steps below, make sure you have the
> [Lightning-CLI](https://rdkcentral.github.io/Lightning-CLI/#/) installed _globally_ only your system

`npm install -g @lightningjs/cli`

#### Running the App

Use `lng dev` to start the watcher and run a local webserver / open the App in a browser _at the same time_

### How it works

A [custom font loader](https://github.com/lewispeel/lightning-html-text/blob/main/src/index.js#L18) is needed to converted each font file to a Base64 encoded string as they're loaded into the browser.

The [`HTMLText`](https://github.com/lewispeel/lightning-html-text/blob/main/src/HTMLText.js) component it uses [`<foreignObject>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/foreignObject) to embed HTML into an SVG which is then drawn to a 2D canvas and attached to a Lightning texture.
