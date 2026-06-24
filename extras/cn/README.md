# cn

A tiny helper that joins conditional class names into a single string, for [Rasti](https://rasti.js.org) + Vite projects. It accepts strings, numbers, nested arrays, and objects whose keys are kept when their value is truthy.

## Usage

```javascript
import cn from './src/index.js';

cn('a', 'b');                     // => 'a b'
cn('a', { b : true, c : false }); // => 'a b'
cn('a', ['b', ['c']]);            // => 'a b c'
cn('base', isActive && 'active'); // conditional, falsy values are skipped
```

In a Rasti component:

```javascript
import cn from '../lib/cn.js';

const Button = Component.create`
    <button class="${({ props }) => cn('button', props.className)}">
        ${({ props }) => props.renderChildren()}
    </button>
`;
```

## API

`cn(...args)` returns a space-separated `string`.

Each argument may be:

| Type | Behavior |
|---|---|
| `string` / `number` | Added as-is when truthy. |
| `Array` | Flattened recursively (nesting supported). |
| `Object` | Each key is added when its value is truthy. |
| falsy (`null`, `undefined`, `false`, `0`, `''`) | Skipped. |

## Copy model

This package is meant to be copied into an application, not installed as a public runtime dependency. `create-rasti` copies `src/index.js` into every generated project as `src/lib/cn.js`.

For manual use:

```bash
cp extras/cn/src/index.js ./my-project/src/lib/cn.js
```

```javascript
import cn from './src/lib/cn.js';
```

## License

[MIT](../../LICENSE)
