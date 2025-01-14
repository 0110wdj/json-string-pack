## use

### import
```js
import { pack, unpack } from 'json-string-pack';
```

### pack
```js
const josn = {"a":[{"b":2}]};
const res = await pack(josn);
console.log(res); // H4sIAAAAAAAAA5s0ecLEhYkTFyZNYpzEMImJCQDW/XDhEAAAAA==
```

### unpack
```js
const res = await unpack_patch("H4sIAAAAAAAAA5s0ecLEhYkTFyZNYpzEMImJCQDW/XDhEAAAAA==");
console.log(res); // {"a":[{"b":2}]}
```
