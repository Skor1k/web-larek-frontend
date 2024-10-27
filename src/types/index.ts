// Слои данных
// Данные с сервера
export interface ILarekAPI {
	getProductList: () => Promise<ICard[]>;
  getProductItem: (id: string) => Promise<ICard>;
	orderItems(order: IOrder): Promise<IOrderResults>;
}

// Карточки
export interface ICardList {
	items: ICard[];
  total: number;
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


// Действие с карточкой
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
// Тип оплаты
export type PaymentMethod = 'онлайн' | '' | 'при получении';

// Тип с адресом
export type TOrderPayment = Pick<IOrder, 'payment' | 'address'>;

// Тип с почтой и телефоном
export type TOrderContacts = Pick<IOrder, 'email' | 'phone'>;

// Общий тип
export type TOrderField = TOrderContacts & TOrderPayment;

// Тип ошибок форм
export type FormErrors = Partial<Record<keyof IOrder, string>>;

// Интерфейс успешной оплаты
export interface IOrderResults {
	id: string;
	total: number;
}

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
	total: number;
}

export interface ISuccessActions {
	onClick: () => void;
}
