// Страница

export interface ICardList {
	total: number;
	items: ICard[];
}

// Карточка
export interface ICard {
  image: string;
  category: string;
  title: string;
  description: string;
  button: string;
  price: number | null;
	id: string;
}


//Действие с карточкой
export interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

// Корзина
export interface IBasket {
	items: HTMLElement[];
	total: number | null;
}

// Заказ
export interface IOrder {
	total: number;
	items: string[];
  address: string;
	email: string;
	phone: string;
	payment: string;
}

//Карточки types

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
	valid: boolean;
	errors: string[];
}

// Интерфейс успешного оформления заказа
export interface ISuccess {
	total: number;
}
