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
	items: TCardBasket[];
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

// Типы
// Категории карточки
export type CardCategory = 'софт-скилл' | 'хард-скилл' | 'дополнительное'	| 'кнопка' | 'другое';

// Карточки для главной
export type TCardPage = Pick<ICard, 'image' | 'category' | 'title' | 'price' | 'id'>;

// Карточки для корзины
export type TCardBasket = Pick<ICard, 'title' | 'price' | 'id'>;

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
