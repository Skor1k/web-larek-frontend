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
		// Удалить или добавить товар в корзину
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

// Открытие модального окна
events.on('modal:open', () => {
	page.locked = true;
});

// Закрытие модального окна
events.on('modal:closed', () => {
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
