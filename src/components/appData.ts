import {
	IProductCard,
	IOrder,
	IOrderForm,
	IContacts,
	IContactsForm,
	ErrorsContacts,
	ErrorsOrder,
} from '../types';
import { Model } from './base/model';

export type CatalogChangeEvent = {
	catalog: ProductCard[];
};

export type ProductStatus = 'basket' | 'sell';

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

export class AppState extends ProductCard {
	basketList: ProductCard[] = [];
	catalog: ProductCard[];
	order: IOrder = {
		address: '',
		items: [],
		payment: 'online',
		email: '',
		phone: '',
		total: 0,
	};

	formErrorsOrder: ErrorsOrder = {};
	formErrorsContacts: ErrorsContacts = {};

	clearBasket() {
		this.basketList.forEach((item) => {
			item.status = 'sell';
		});
		this.basketList = [];
	}

	getTotal() {
		return this.basketList.reduce((a, c) => a + c.price, 0);
	}

	setCatalog(items: IProductCard[]) {
		this.catalog = items.map((item) => new ProductCard(item, this.events));
		this.emitChanges('catalog:install', { catalog: this.catalog });
	}

	setOrderField(field: keyof IOrderForm, value: string) {
		this.order[field] = value;

		if (this.validateOrder()) {
			this.events.emit('order:ready', this.order);
		}
	}

	validateOrder() {
		const errors: typeof this.formErrorsOrder = {};

		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		}
		this.formErrorsOrder = errors;
		this.events.emit('formErrorsOrder:change', this.formErrorsOrder);

		return Object.keys(errors).length === 0;
	}

	setContactsField(field: keyof IContactsForm, value: string) {
		this.order[field] = value;
		if (this.validateContacts()) {
			this.events.emit('contacts:ready', this.order);
		}
	}

	validateContacts() {
		const errors: typeof this.formErrorsContacts = {};

		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		this.formErrorsContacts = errors;
		this.events.emit('formErrorsContacts:change', this.formErrorsContacts);

		return Object.keys(errors).length === 0;
	}

	toggleBasketList(item: ProductCard) {
		if (item.status === 'sell' && item.price !== null) {
			this.basketList.push(item);
			item.status = 'basket';
			item.count = this.basketList.length;
			this.emitChanges('basket:changed', this.basketList);
		} else if (item.status === 'basket') {
			this.basketList = this.basketList.filter((it) => it !== item);
			item.status = 'sell';
			item.count = this.basketList.length;
			this.emitChanges('basket:changed', this.basketList);
		}
	}

	getBasketList(): ProductCard[] {
		return this.basketList;
	}
}
