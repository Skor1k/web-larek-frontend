import { EventEmitter } from './components/base/events';
import './scss/styles.scss';

//MVP
interface IBasketModel {
  items: Map<string, number>;
  add (id: string): void;
  remove(id: string): void;
}

interface IEventEmitter {
  emit: (event: string, data: unknown) => void;
}

//Версия 02 с помощью событий
class BasketModel implements IBasketModel {
  constructor(protected events: IEventEmitter) {}

  add (id: string): void {
  // Cоздаем новый
    this._changed();
  }

  remove(id: string): void {
    // Удаляем
    this._changed();
  }

  protected _changed() { // метод генерирующий уведомление об изменении
    this.events.emit('basket:change', { items: Array.from(this.items.keys()) });
  }
}

// Для основного файла
const events = new EventEmitter();

const basket = new BasketModel(events);

events.on('basket:change', (data: { items: string[] }) => {
// Выводим куда-то
});

interface IProduct {
  id: string;
  title: string;
}

interface CatalogModel {
  items: IProduct [];
  setItems(items: IProduct[]): void; // чтобы установить после загрузки из апи
  getProduct (id: string): IProduct; // чтобы получить при рендере списков
}

interface IViewConstructor {
  new (container: HTMLElement, events?: IEventEmitter): IView; // На входе контейнер в которыйбудем выводить
}

interface IView {
  render(data: object): HTMLElement; //Устанавливаем данные, возврощаем контейнер
}

// Реализация товара в корзине
class BasketItemView implements IView {
// элементы внутри контейнера
protected title: HTMLSpanElement;
protected addButton: HTMLButtonElement;
protected removeButton: HTMLButtonElement;

// данные, которые хотим сохранить на будущее
protected id: string | null = null;

constructor (protected container: HTMLElement, protected events: IEventEmitter) {
  // инициализируем, чтобы не искать повторно
  this.title = container.querySelector('.basket-item__title') as HTMLSpanElement;
  this.addButton = container.querySelector('.basket-item__add') as HTMLButtonElement;
  this.removeButton = container.querySelector('.basket-item__remove') as HTMLButtonElement;

  // устанавливаем события
  this.addButton.addEventListener('click', () => {
    // генерируем событие в нашем брокере
    this.events.emit('ui:basket-add', { id: this.id });
  });

  this.addButton.addEventListener('click', () => {
  this.events.emit ('ui:basket-remove', { id: this.id });
  });
}


render(data: { id: string, title: string }) {
  if (data) {
    // если есть новые данные, то запомним их
    this.id = data.id;
    // и выведем в интерфейс
    this.title.textContent = data.title;
  }
  return this.container;
}

// Класс корзины
class BasketView {
  constructor(protected container: HTMLElement) {}
  render (data: { items: HTMLElement[] }) {
    if (data) {
      this.container.replaceChildren(...data.items);
    }
    return this.container;
  }
}

//Инициализация
const api = new ShopAPI();
const events = new EventEmitter();
const basketView = new BasketView(document.querySelector ('.basket'));
const basketModel = new BasketModel(events);
const catalogModel = new CatalogModel(events);

// можно собрать в функции или классы отдельные экраны с логикой их формирования
function renderBasket(items: string[]) {
  basketView.render(
  items.map(id => {
    const itemView = new BasketItemView(events);
    return itemView.render(catalogModel.getProduct(id));
    })
  );
}

// при изменении рендерим
events.on('basket:change', (event: { items: string[] }) => {
  renderBasket(event.items);
});

// при действиях изменяем модель, а после этого случится рендер
events.on('ui:basket-add', (event: { id: string }) => {
  basketModel.add(event.id);
});

events.on('ui:basket-remove', (event: { id: string }) => {
  basketModel.remove(event.id);
});

// подгружаем начальные данные и запускаем процессы
api.getCatalog()
.then(catalogModel.setItems.bind(catalogModel))
.catch(err => console.error(err));






//Версия 01 без использования событий
  // class BasketModel implements IBasketModel {
  //   items: Map<string, number> = new Map();

  //   add (id: string): void {
  //     if (!this.items.has(id)) this.items.set(id, 0); // создаем новый
  //     this.items.set(id, this.items.get(id)! + 1); // прибавляем количество
  //   }
  //   remove(id: string): void {
  //     if (!this.items.has(id)) return; // если нет, нечего не делаем
  //     if (this.items.get(id)! > 0) { // если есть и больше ноля
  //       this.items.set(id, this.items.get(id)! - 1); // уменьшаем
  //       if (this.items.get (id) === 0) this.items.delete(id); // если ноль — удаляем
  //     }
  //   }
  // }

