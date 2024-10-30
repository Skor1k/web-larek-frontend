import './scss/styles.scss';
import { Page } from './components/page';
import { cloneTemplate, ensureElement } from './utils/utils';
import { EventEmitter } from './components/base/events';
import { AppState, ProductCard } from './components/appData';
import { Card } from './components/card';
import { WebLarekAPI } from './components/webLarekAPI';
import { API_URL, CDN_URL, paymentMethods } from './utils/constants';
import { IOrder, IOrderForm, IContactsForm } from './types';
import { Modal } from './components/common/modal';
import { Basket } from './components/common/basket';
import { OrderForm } from './components/order';
import { Contacts } from './components/contacts';
import { Success } from './components/common/success';

const events = new EventEmitter();
const api = new WebLarekAPI(CDN_URL, API_URL);

// Шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных
const appData = new AppState({}, events);

// Контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new OrderForm(cloneTemplate(orderTemplate), events, {
	onClick: (evt: Event) => events.emit('payment:toggle', evt.target),
});
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);

// Показ каталога товаров
events.on('catalog:install', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			title: item.title,
			image: item.image,
			category: item.category,
			price: item.price,
		});
	});
});

// Открыть карточку товара
events.on('card:select', (item: ProductCard) => {
	const card = new Card(cloneTemplate(cardPreviewTemplate), {
		// Удалить|добавить товар в корзину
		onClick: () => {
			events.emit('item:toggle', item);
			page.counter = appData.getBasketList().length;
			card.buttonText = item.status;
		},
	});
	return modal.render({
		content: card.render({
			title: item.title,
			image: item.image,
			description: item.description,
			price: item.price,
			category: item.category,
			buttonText: item.status,
		}),
	});
});

// Блокировка прокрутки страницы
events.on('modal:open', () => {
	page.locked = true;
});

// Разблокировка прокрутки страницы
events.on('modal:close', () => {
	page.locked = false;
});

// Открытие корзины
events.on('basket:open', () => {
	basket.items = appData.getBasketList().map((item, index) => {
		const card = new Card(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				events.emit('item:toggle', item);
			},
		});
		card.index = (index + 1).toString();
		return card.render({
			title: item.title,
			price: item.price,
		});
	});
	page.counter = appData.getBasketList().length;
	basket.selected = appData.getBasketList();
	basket.total = appData.getTotal();
	appData.order.total = appData.getTotal();
	return modal.render({
		content: basket.render(),
	});
});

// Удаление из корзины
events.on('item:toggle', (item: ProductCard) => {
	appData.toggleBasketList(item);

	page.counter = appData.getBasketList().length;
});

// Изменилось состояние корзины
events.on('basket:changed', (items: ProductCard[]) => {
	basket.items = items.map((item, index) => {
		const card = new Card(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				events.emit('item:toggle', item);
			},
		});
		card.index = (index + 1).toString();
		return card.render({
			title: item.title,
			price: item.price,
		});
	});
	appData.order.total = appData.getTotal();
	basket.total = appData.getTotal();
});

// Модальное окно заказа
events.on('order:open', () => {
	modal.render({
		content: order.render({
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

// Способ оплаты
events.on('payment:toggle', (name: HTMLElement) => {
	if (!name.classList.contains('button_alt-active')) {
		order.selectPaymentMethod(name);
		appData.order.payment = paymentMethods[name.getAttribute('name')];
	}
});

// Изменение полей заказа
events.on(
	/^order\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value);
	}
);

// Валидация полей заказа
events.on('formErrorsOrder:change', (errors: Partial<IOrder>) => {
	const { address } = errors;
	order.valid = !address;
	order.errors = Object.values({ address }).filter(Boolean).join('; ');
});

// Отправка формы
events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			email: '',
			phone: '',
			valid: false,
			errors: [],
		}),
	});
	appData.order.items = appData.basketList.map((item) => item.id);
});

// Изменение полей контактов
events.on(
	/^contacts\.[^:]*:change/,
	(data: { field: keyof IContactsForm; value: string }) => {
		appData.setContactsField(data.field, data.value);
	}
);

// Валидация полей контактов
events.on('formErrorsContacts:change', (errors: Partial<IOrder>) => {
	const { email, phone } = errors;
	contacts.valid = !email && !phone;
	contacts.errors = Object.values({ email, phone }).filter(Boolean).join('; ');
});

// Оплата
events.on('contacts:submit', () => {
	api
		.orderResult(appData.order)
		.then((result) => {
			appData.clearBasket();
			page.counter = appData.getBasketList().length;
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
				},
			});
			success.total = result.total;

			modal.render({
				content: success.render({}),
			});
		})
		.catch((err) => {
			console.error(err);
		});
});

// Каталог товаров с сервера
api
	.getProductList()
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.error(err);
	});


// //1111111111111
// import './scss/styles.scss';
// import { AppState } from './components/appData';
// import { BasketCard, Card } from './components/card';
// import { LarekAPI } from './components/webLarekAPI';
// import { Page } from './components/page';
// import { EventEmitter } from './components/base/events';
// import { Basket } from './components/common/basket';
// import { Modal } from './components/common/modal';
// import { OrderContacts, OrderPayment } from './components/order';
// import { Success } from './components/common/success';
// import { ICard, IOrder } from './types';
// import { API_URL, CDN_URL } from './utils/constants';
// import { cloneTemplate, ensureElement } from './utils/utils';

// const events = new EventEmitter();
// const api = new LarekAPI(CDN_URL, API_URL);

// // Модель данных приложения
// const appData = new AppState({}, events);

// // Все шаблоны
// const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
// const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
// const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
// const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
// const paymentTemplate = ensureElement<HTMLTemplateElement>('#order');
// const contacsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
// const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// // Глобальные контейнеры
// const modalWindow = ensureElement<HTMLElement>('#modal-container');
// const pageBody = document.body;

// const page = new Page(pageBody, events);
// const modal = new Modal(modalWindow, events);

// // Переиспользуемые части интерфейса
// const basket = new Basket(cloneTemplate(basketTemplate), events);
// const paymentForm = new OrderPayment(cloneTemplate(paymentTemplate), events);
// const contactForm = new OrderContacts(cloneTemplate(contacsTemplate), events);

// // Дальше идет бизнес-логика
// // Поймали событие, сделали что нужно

// // Инициализация каталога
// api
// 	.getProductList()
// 	.then(appData.setCatalog.bind(appData))
// 	.catch((err) => {
// 		console.error(err);
// 	});

// // Инициализация или изменение элементов в каталоге
// events.on('cards:changed', () => {
// 	page.counter = appData.basket.length;
// 	page.gallery = appData.catalog.map((item) => {
// 		const card = new Card(cloneTemplate(cardCatalogTemplate), {
// 			onClick: () => {
// 				events.emit('card:selected', item);
// 			},
// 		});
// 		return card.render(item);
// 	});
// });

// // Выбор карточки как элемент превью
// events.on('card:selected', (item: ICard) => {
// 	appData.setPreview(item);
// });

// // Изменение превью
// events.on('preview:changed', (item: ICard) => {
// 	const card = new Card(cloneTemplate(cardPreviewTemplate), {
// 		onClick: () => {
// 			events.emit('card:basket', item);
// 			events.emit('preview:changed', item);
// 			modal.close();
// 		},
// 	});
// 	modal.render({
// 		content: card.render({
// 			id: item.id,
// 			title: item.title,
// 			image: item.image,
// 			description: item.description,
// 			price: item.price,
// 			category: item.category,
// 			button: appData.getButtonStatus(item),
// 		}),
// 	});
// });

// // // Отправка карточки в корзину
// events.on('card:basket', (item: ICard) => {
// 	appData.toggleBasketCard(item);
// });

// // Открытие корзины
// events.on('basket:open', () => {
// 	modal.render({
// 		content: basket.render(),
// 	});
// });

// // // Изменение данных корзины
// events.on('basket:changed', () => {
// 	page.counter = appData.basket.length;
// 	basket.sum = appData.getBasketTotal();
// 	basket.items = appData.basket.map((basketCard) => {
// 		const newBasketCard = new BasketCard(cloneTemplate(cardBasketTemplate), {
// 			onClick: () => {
// 				appData.deleteCardFromBasket(basketCard);
// 			},
// 		});
// 		newBasketCard.index = appData.getCardIndex(basketCard);
// 		return newBasketCard.render({
// 			title: basketCard.title,
// 			price: basketCard.price,
// 		});
// 	});
// });

// // Открытие формы заказа
// events.on('order:open', () => {
// 	paymentForm.clearPayment();
// 	modal.render({
// 		content: paymentForm.render({
// 			address: '',
// 			valid: false,
// 			errors: [],
// 		}),
// 	});
// });

// // Изменилось одно из полей
// events.on(
// 	/^order\..*:changed/,
// 	(data: {
// 		field: keyof Pick<IOrder, 'address' | 'phone' | 'email'>;
// 		value: string;
// 	}) => {
// 		appData.setOrderField(data.field, data.value);
// 	}
// );

// // // Изменения в заказе
// events.on('order:changed', (data: { payment: string; button: HTMLElement }) => {
// 	paymentForm.togglePayment(data.button);
// 	appData.setOrderPayment(data.payment);
// 	appData.validateOrder();
// });

// // // Подтверджение формы оплаты
// events.on('order:submit', () => {
// 	modal.render({
// 		content: contactForm.render({
// 			phone: '',
// 			email: '',
// 			valid: false,
// 			errors: [],
// 		}),
// 	});
// });

// // Подтверджение формы контактов
// events.on('contacts:submit', () => {
// 	appData.setBasketToOrder();
// 	api
// 		.orderItems(appData.order)
// 		.then((result) => {
// 			console.log(appData.basket, appData.order);
// 			const successWindow = new Success(cloneTemplate(successTemplate), {
// 				onClick: () => {
// 					modal.close();
// 				},
// 			});
// 			appData.clearBasket();
// 			appData.clearOrder();

// 			modal.render({ content: successWindow.render({ total: result.total }) });
// 		})
// 		.catch((err) => {
// 			console.error(`Ошибка выполнения заказа ${err}`);
// 		});
// });

// // Изменилось состояние валидации формы
// events.on('formErrors:changed', (errors: Partial<IOrder>) => {
// 	const { email, phone, address, payment } = errors;
// 	paymentForm.valid = !payment && !address;
// 	paymentForm.errors = Object.values({ payment, address })
// 		.filter((i) => !!i)
// 		.join('; ');
// 	contactForm.valid = !email && !phone;
// 	contactForm.errors = Object.values({ email, phone })
// 		.filter((i) => !!i)
// 		.join('; ');
// });

// // Открытие модального окна
// events.on('modal:open', () => {
// 	page.locked = true;
// });

// // Закрытие модального окна
// events.on('modal:closed', () => {
// 	page.locked = false;
// });







// //2222222222222

// import { EventEmitter } from './components/base/events';
// import './scss/styles.scss';

// //MVP
// interface IBasketModel {
//   items: Map<string, number>;
//   add (id: string): void;
//   remove(id: string): void;
// }

// interface IEventEmitter {
//   emit: (event: string, data: unknown) => void;
// }

// //Версия 02 с помощью событий
// class BasketModel implements IBasketModel {
//   constructor(protected events: IEventEmitter) {}

//   add (id: string): void {
//   // Cоздаем новый
//     this._changed();
//   }

//   remove(id: string): void {
//     // Удаляем
//     this._changed();
//   }

//   protected _changed() { // метод генерирующий уведомление об изменении
//     this.events.emit('basket:change', { items: Array.from(this.items.keys()) });
//   }
// }

// // Для основного файла
// const events = new EventEmitter();

// const basket = new BasketModel(events);

// events.on('basket:change', (data: { items: string[] }) => {
// // Выводим куда-то
// });

// interface IProduct {
//   id: string;
//   title: string;
// }

// interface CatalogModel {
//   items: IProduct [];
//   setItems(items: IProduct[]): void; // чтобы установить после загрузки из апи
//   getProduct (id: string): IProduct; // чтобы получить при рендере списков
// }

// interface IViewConstructor {
//   new (container: HTMLElement, events?: IEventEmitter): IView; // На входе контейнер в которыйбудем выводить
// }

// interface IView {
//   render(data: object): HTMLElement; //Устанавливаем данные, возврощаем контейнер
// }

// // Реализация товара в корзине
// class BasketItemView implements IView {
// // элементы внутри контейнера
// protected title: HTMLSpanElement;
// protected addButton: HTMLButtonElement;
// protected removeButton: HTMLButtonElement;

// // данные, которые хотим сохранить на будущее
// protected id: string | null = null;

// constructor (protected container: HTMLElement, protected events: IEventEmitter) {
//   // инициализируем, чтобы не искать повторно
//   this.title = container.querySelector('.basket-item__title') as HTMLSpanElement;
//   this.addButton = container.querySelector('.basket-item__add') as HTMLButtonElement;
//   this.removeButton = container.querySelector('.basket-item__remove') as HTMLButtonElement;

//   // устанавливаем события
//   this.addButton.addEventListener('click', () => {
//     // генерируем событие в нашем брокере
//     this.events.emit('ui:basket-add', { id: this.id });
//   });

//   this.addButton.addEventListener('click', () => {
//   this.events.emit ('ui:basket-remove', { id: this.id });
//   });
// }


// render(data: { id: string, title: string }) {
//   if (data) {
//     // если есть новые данные, то запомним их
//     this.id = data.id;
//     // и выведем в интерфейс
//     this.title.textContent = data.title;
//   }
//   return this.container;
// }

// // Класс корзины
// class BasketView {
//   constructor(protected container: HTMLElement) {}
//   render (data: { items: HTMLElement[] }) {
//     if (data) {
//       this.container.replaceChildren(...data.items);
//     }
//     return this.container;
//   }
// }

// //Инициализация
// const api = new ShopAPI();
// const events = new EventEmitter();
// const basketView = new BasketView(document.querySelector ('.basket'));
// const basketModel = new BasketModel(events);
// const catalogModel = new CatalogModel(events);

// // можно собрать в функции или классы отдельные экраны с логикой их формирования
// function renderBasket(items: string[]) {
//   basketView.render(
//   items.map(id => {
//     const itemView = new BasketItemView(events);
//     return itemView.render(catalogModel.getProduct(id));
//     })
//   );
// }

// // при изменении рендерим
// events.on('basket:change', (event: { items: string[] }) => {
//   renderBasket(event.items);
// });

// // при действиях изменяем модель, а после этого случится рендер
// events.on('ui:basket-add', (event: { id: string }) => {
//   basketModel.add(event.id);
// });

// events.on('ui:basket-remove', (event: { id: string }) => {
//   basketModel.remove(event.id);
// });

// // подгружаем начальные данные и запускаем процессы
// api.getCatalog()
// .then(catalogModel.setItems.bind(catalogModel))
// .catch(err => console.error(err));






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

