## russian-post

![Почта России](https://tracking.pochta.ru/tracking-web-static/style/img/logo-rp.png)

## Node.JS library to work with official API of Russian Post | Библиотека для работы с официальным API "Почта России" из Node.JS

![Typed with TypeScript](https://camo.githubusercontent.com/41c68e9f29c6caccc084e5a147e0abd5f392d9bc/68747470733a2f2f62616467656e2e6e65742f62616467652f547970655363726970742f7374726963742532302546302539462539322541412f626c7565) [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=tinovyatkin_russian-post&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=tinovyatkin_russian-post) [![codecov](https://codecov.io/gh/tinovyatkin/russian-post/branch/master/graph/badge.svg)](https://codecov.io/gh/tinovyatkin/russian-post)

## 1. Install / Установка

```sh
yarn add russian-post
# or | или
npm i russian-post --save
```

## 2. Get credentials / Получите доступ

Get your API access login and password at <https://tracking.pochta.ru/access-settings>
Then either pass them to the constructor directly or set via `RUSSIAN_POST_LOGIN` and `RUSSIAN_POST_PASSWORD` environment variables.

Параметры доступа (логин и пароль) могут быть получены в разделе [Настройки доступа](https://tracking.pochta.ru/access-settings) зарегистрированного пользователя, у которого подключен доступ к API. Затем или передавайте их в конструктор класса или установите в переменные среды `RUSSIAN_POST_LOGIN` и `RUSSIAN_POST_PASSWORD`

## 3. Use / Используйте

```js
import { Tracking } from 'russian-post';

const tracking = new Tracking({
  login: 'D...zyLRl',
  password: 'z...',
  language: 'ENG', // по-умолчанию 'RUS'
});

(async () => {
  console.log(await tracking.getHistory('RS253...'));
})();
```

## 4. License / Лицензия

MIT licensed by Konstantin Vyatkin <tino@vtkn.io>
