## russian-post

![Почта России](https://tracking.pochta.ru/tracking-web-static/style/img/logo-rp.png)

## Node.JS library to work with official API of Russian Post ![Typed with TypeScript](https://flat.badgen.net/badge/icon/Typed?icon=typescript&label&labelColor=blue&color=555555)

```js
const tracking = new Tracking({
  login: 'D...zyLRl',
  password: 'z...',
});
await tracking.getHistory('RS253...');
```
