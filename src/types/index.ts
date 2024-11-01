// Слои данных
// Карточки
export interface ICardList {
	items: ICard[];
  total: number;
}

// Карточка товара
export interface IProductCard {
  image: string;
  category: string;
  title: string;
  description: string;
  button: string;
  price: number | null;
	id: string;
}

// Карточка отображение
export interface ICard extends IProductCard {
	buttonText: string;
	сount: number | string;
}

// Действие с карточкой
export interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

// Корзина
export interface IBasket {
	items: HTMLElement[];
	total: number | string;
	selected: string[];
}

// Контакты покупателя
export interface IContactsForm {
	email: string;
	phone: string;
}

// Адрес
export interface IOrderForm {
	payment: string;
	address: string;
}

// Список покупок
export interface IOrder extends IOrderForm, IContactsForm {
	total: number | string;
	items: string[];
}

// Данные покупателя
export interface IContacts extends IContactsForm {
	items: string[];
}

// Тип ошибок форм
export type ErrorsOrder = Partial<Record<keyof IOrder, string>>;
export type ErrorsContacts = Partial<Record<keyof IContacts, string>>;


// Слой представления
// Интерфейс страницы
export interface IPage {
  catalog: HTMLElement[];
	locked: boolean;
}

// Интерфейс модального окна
export interface IModalData {
	content: HTMLElement;
}

// Интерфейс форм
export interface IForm {
	errors: string[];
  valid: boolean;
}

// Интерфейс успешного заказа
export interface ISuccess {
  id: string;
	total: number;
}

export interface ISuccessActions {
	onClick: () => void;
}

// Интерфейс успешной оплаты
export interface IOrderResults {
	id: string;
	total: number;
}
