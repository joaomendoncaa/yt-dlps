![NPM Version](https://img.shields.io/npm/v/bento-js)

<p align="center">
    <img src="logo/Bento Logo Dark.svg#gh-dark-mode-only" height="200">
    <img src="logo/Bento Logo Light.svg#gh-light-mode-only" height="200">
</p>

<p align="center">
<em>A simple, small, modern, dependency-free JavaScript bento box grid system.</em>
Checkout a working example <a href="https://mubanga90.github.io/bento/">here</a>
</p>

## Install

Install using

```
npm i bento-js
```

## Basic Usasage

Create some markup, this should be a container for your grid, with children for you grid items:

```
<div id="grid">
    <div>Item 0</div>
    <div>Item 1</div>
    <div>Item 2</div>
</div>
```

Import Bento Grid and initialize for each grid on your page:

```
import Bento from 'bento-js';

const bentoInstance = new Bento(document.querySelector<HTMLElement>('#grid'))
```

You should provide your own styling for the elements. It is important that the container has a width and a height, as that will be used for calculating the number of columns and rows.

```
#grid {
	width: 100dvw;
	height: 100dvh;
}
```

Resize to see it an action!

## Options

### Bento Options

The bento options object contains options for the grid. For now only one options is available `preferredCellSize: { x: number, y: number }` this represents the preferred (minimum) size each cell in px. This is used to calculate number of columns and rows based on the given size of the grid element.

```
const bentoOptions = {
	preferredCellSize: { x: 120, y: 115 },
};

const bentoInstance = new Bento(
	document.querySelector<HTMLElement>('#grid')!,
	bentoOptions
);
```

### Item options

Item options are passed as data attributes, currently the only options are `min-width` and `min-height` these denounce the number of columns and rows the specific item should span at a minimum.

```
<div data-min-width="5" data-min-height="2">Item 0</div>
```

## How it works

Bento Grid looks at the rect size of the element and tries to fill it with it's children using a similar algorithm as [grid-auto-flow: dense](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow). It will try to place each item, checking each cell from left to right, top to bottom, if an item can't be placed (because it is to big or no cells are available, it will skip it).

Then it will try to stretch each cell to fill empty space, prioritizing horizontal stretching.

By default Bento Grid will run window resize. If you need to retrigger it yourself you can call:

```
bentoInstance.setLayout();
```

## Planned features

- Flow direction
- Filling
- Flexible height/width
- Center, stretch, etc.
- Max size
- Aspect ratio
- Animations
- Drag and drop

## Contributing

You should contact [Mubanga90](https://github.com/mubanga90), if you wish to make contributions, before you start. The general structure as well as develpment tools are subject to change in the up comming releases, as the project is in a very fluid early stage.

That is not to say help isn't welcome, but it would be better to discuss what and how before you start.

### Running in dev mode

Example usage code can be found in `./src/example`

```
npm run dev
```

Will start dev mode, with HMR. The example page will be served at http://localhost:5173/src/example/index.html

## Authors

- **Douwe Mubanga de Vries** - _Creator_ - [Mubanga90](https://github.com/mubanga90)
