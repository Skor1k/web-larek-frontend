import { Component } from './base/component';
import { IEvents } from './base/events';
import { IBasket } from '../types';
import { createElement, ensureElement } from '../utils/utils';

export class Basket extends Component<IBasket> {
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._total = this.container.querySelector('.basket__price');
		this._button = this.container.querySelector('.basket__button');

		if (this._button) {
			this._button.addEventListener('click', () => {
				events.emit('order:open');
			});
		}

		this.items = [];
	}

  protected toggleButton(state: boolean) {
    this.setDisabled(this._button, state);
  };

	set items(items: HTMLElement[]) {
		if (items.length) {
			this._list.replaceChildren(...items);
			this.toggleButton(false);
		} else {
			this._list.replaceChildren(
				createElement('p', { textContent: 'Товары еще не добавлены в корзину' })
			);
			this.toggleButton(true);
		}
	}

	set total(total: number) {
		this.setText(this._total, `${total} синапсов`);
	}
}
