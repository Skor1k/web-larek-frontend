import { Component } from './base/component';
import { ICard, ICardActions } from '../types';
import { ensureElement } from '../utils/utils';
import { categoryBadge } from '../utils/constants';

export class Card extends Component<ICard> {
	protected _image: HTMLImageElement;
	protected _category: HTMLSpanElement;
	protected _title: HTMLElement;
	protected _description?: HTMLElement;
	protected _buttonText: string;
	protected _button: HTMLButtonElement;
	protected _price: HTMLSpanElement;
	protected _index: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);

		this._image = container.querySelector(`.card__image`);
		this._category = container.querySelector(`.card__category`);
		this._title = ensureElement<HTMLElement>(`.card__title`, container);
		this._description = container.querySelector(`.card__text`);
		this._button = container.querySelector(`.card__button`);
		this._price = container.querySelector(`.card__price`);
		this._index = container.querySelector('.basket__item-index');

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set category(value: string) {
		this.setText(this._category, value);
		this.toggleClass(this._category, categoryBadge[value], true);
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set description(value: string) {
		this.setText(this._description, value);
	}

	set buttonText(status: string) {
		if (status === 'basket') {
			this.setText(this._button, 'Удалить');
		} else {
			this.setText(this._button, 'В корзину');
		}
	}

	set price(value: number | null) {
		if (value !== null) {
			this.setText(this._price, `${value} синапсов`);
		} else {
			this.setText(this._price, 'Бесценно');
			if (this._button) {
				this.setDisabled(this._button, true);
			}
		}
	}

	set index(value: string) {
		this.setText(this._index, value);
	}

	get index(): string {
		return this._index.textContent || '';
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}
}
