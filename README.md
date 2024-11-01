# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом
- src/components/common/ — папка с компонентами

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP:
- слой представления, отвечает за отображение данных на странице,
- слой данных, отвечает за хранение и изменение данных
- презентер, отвечает за связь представления и данных.

## Данные и типы данных, используемые в приложении

### Интерфейс ICard
Блок с карточками
```
export interface ICardList {
	items: ICard[];
  total: number;
}
```

### Интерфейс IProductItem
Информация о товаре
```
export interface IProductCard {
  image: string;
  category: string;
  title: string;
  description: string;
  button: string;
  price: number | null;
	id: string;
}
```

## Интерфейс ICard
Интерфейс для модели данных карточек
```
export interface ICard extends IProductCard {
	buttonText: string;
	сount: number | string;
}
```

## Интерфейс ICardActions
Интерфейс действий с карточкой товара
```
export interface ICardActions {
	onClick: (event: MouseEvent) => void;
}
```

## Интерфейс IBasket
Интерфейс содержимого корзины
```
export interface IBasket {
	items: HTMLElement[];
	total: number | string;
	selected: string[];
}
```

## Интерфейс IContactsForm
Интерфейс данных о заказе, содержит почту и телефон
```
export interface IContactsForm {
	email: string;
	phone: string;
}
```

## Интерфейс IContactsForm
Интерфейс данных о заказе, содержит способ оплаты и адрес
```
export interface IOrderForm {
	payment: string;
	address: string;
}
```

## Интерфейс IOrder
Интерфейс добавляет описания данных о заказе
```
export interface IOrder extends IOrderForm, IContactsForm {
	total: number | string;
	items: string[];
}
```

## Интерфейс IContacts
Интерфейс добавляет поле для описания данных покупателя
```
export interface IContacts extends IContactsForm {
	items: string[];
}
```

## Типы ошибок ErrorsOrder и ErrorsContacts
Типы ошибок для форм заказа и данных покупателя
```
export type ErrorsOrder = Partial<Record<keyof IOrder, string>>;
```
```
export type ErrorsContacts = Partial<Record<keyof IContacts, string>>;
```

## Слои представления

### Интерфейс IPage
Интерфейс главной страницы
```
export interface IPage {
  catalog: HTMLElement[];
	locked: boolean;
}
```

### Интерфейс IModalData
Интерфейс модального окна
```
export interface IModalData {
	content: HTMLElement;
}
```

### Интерфейс IForm
Интерфейс форм
```
export interface IForm {
	errors: string[];
  valid: boolean;
}
```

### Интерфейс ISuccess
Интерфейс успешного завершения заказа
```
export interface ISuccess {
  id: string;
	total: number;
}
```
```
export interface ISuccessActions {
	onClick: () => void;
}
```

### Интерфейс IOrderResults
Интерфейс успешной оплаты заказа
```
export interface IOrderResults {
	id: string;
	total: number;
}
```

## Базовый код

### Класс Api
Содержит в себе базовую логику отправки запросов. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.
Методы:
- `get` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

### Класс Component
Класс является дженериком и родителем всех компонентов слоя представления. В дженерик принимает тип объекта, в котором данные будут передаваться в метод render для отображения данных в компоненте. В конструктор принимает элемент разметки, являющийся основным родительским контейнером компонента. Содержит метод render, отвечающий за сохранение полученных в параметре данных в полях компонентов через их сеттеры, возвращает обновленный контейнер компонента.

### Класс EventEmitter
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.
Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on` - подписка на событие
- `off` - снимает обработчик подписки на событие
- `onAll` - слушает все события
- `offAll` - сбрасывает все обработчики событий
- `emit` - инициализация события
- `trigger` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие

### Класс Model
Абстрактный класс, для управления данными и взаимодействия с событиями
Содержит метод:
- emitChanges(event: string, payload?: object) - cообщает что модель поменялась

### Слой данных

### Класс Basket
Класс отображения корзины
Сеттеры:
- set items(items: HTMLElement[]) - товары в корзине
- set total(total: number | string) - сумма всех товаров

### Класс Form
Класс управления формами
Содержит методы:
- onInputChange(field: keyof T, value: string) - изменение значений полей формы
- render(state: Partial<T> & IFormState) - возвращение формы с новым состоянием
Сеттеры:
- set valid(value: boolean) - валидация полей
- set errors(value: string) - вывод информации об ошибках

### Класс Modal
Реализует модальное окно. Так же предоставляет методы `open` и `close` для управления отображением модального окна. Устанавливает слушатели на клавиатуру, для закрытия модального окна по Esc, на клик в оверлей и кнопку-крестик для закрытия попапа.
- constructor(selector: string, events: IEvents) Конструктор принимает селектор, по которому в разметке страницы будет идентифицировано модальное окно и экземпляр класса `EventEmitter` для возможности инициации событий.

Поля класса
- modal: HTMLElement - элемент модального окна
- events: IEvents - брокер событий

### Класс Success
Класс успешного завершения заказа
- set total(total: number | string) - общая сумма заказа

### Классы представления
Все классы представления отвечают за отображение внутри контейнера (DOM-элемент) передаваемых в них данных.

### Класс Card
Класс для создания карточки товара. Наследует класс Component. Содержит сеттеры и геттеры:
- set image(value: string) - url изображения товара
- set category(value: string) - категория товара

- set title(value: string) - название товара
- get title(): string

- set description(value: string) - описание товара
- set buttonText(status: string) - текст кнопки в карточке
- set price(value: number | null) - цена товара

- set index(value: string) - индекс товара
- get index(): string

### Класс Contacts
Класс управления формой контактных данных пользователя Cеттеры:
- set phone(value: string) - телефон
- set email(value: string) - почта

## Класс Order
Класс выбора способа оплаты и ввода адреса доставки
Содержит метод:
- selectPaymentMethod(name: HTMLElement) - способ оплаты

Сеттер:
- set address(value: string) - адрес доставки

## Класс Page
Класс интерфейса главной страницы
Cеттеры:
- set counter(value: number | null) - счётчик товаров в корзине
- set catalog(items: HTMLElement[]) - каталог товаров
- set locked(value: boolean) - блокировка прокрутки страницы

### Слой коммуникации

## Взаимодействие компонентов
Код, описывающий взаимодействие представления и данных между собой находится в файле `index.ts`, выполняющем роль презентера.\
Взаимодействие осуществляется за счет событий генерируемых с помощью брокера событий и обработчиков этих событий, описанных в `index.ts`\
В `index.ts` сначала создаются экземпляры всех необходимых классов, а затем настраивается обработка событий.

## Класс ProductCard
Наследует класс Model и создает экземпляр товара
```
export class ProductCard extends Model<IProductCard> {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
	status: ProductStatus = 'sell';
	count: number;
}

```

### Класс AppState
Класс для управления данными и событиями
Содержит методы:
- clearBasket() - очистить корзину
- getTotal() - общая сумма заказа
- setCatalog(items: IProductItem[]) - список товаров
- setOrderField(field: keyof IOrderForm, value: string) - изменение полей заказа
- validateOrder() - валидация полей
- setContactsField(field: keyof IContactsForm, value: string) - изменение полей контактной информации
- validateContacts() - валидация полей контактной информации
- toggleBasketList(item: ProductItem) - удаление или добавление товар в список корзины
- getBasketList(): ProductItem[] - список корзины

## Класс WebLarekAPI
Класс получения информации с сервера. Наследует базовый класс Api.
Содержит метод:
- getProductList(): Promise<IProductItem[]> - получить список товаров с сервера
- orderResult(order: IOrder): Promise<ISuccess> - отправить результат заказа
