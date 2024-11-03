import { Component } from './base/component';
import { IEvents } from '../components/base/events';
import { IPage } from '../types';
import { ensureElement } from '../utils/utils';

export class Page extends Component<IPage> {
	protected _wrapper: HTMLElement;
	protected _catalog: HTMLElement;
	protected _basket: HTMLElement;
	protected _counter: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._wrapper = ensureElement<HTMLElement>('.page__wrapper');
		this._catalog = ensureElement<HTMLElement>('.gallery');
		this._basket = ensureElement<HTMLElement>('.header__basket');
		this._counter = ensureElement<HTMLElement>('.header__basket-counter');

		this._basket.addEventListener('click', () => {
			this.events.emit('basket:open');
		});
	}

	set locked(value: boolean) {
		this.toggleClass(this._wrapper, 'page__wrapper_locked', value);
	}

	set catalog(items: HTMLElement[]) {
		this._catalog.replaceChildren(...items);
	}

	set counter(value: number | null) {
		this.setText(this._counter, String(value));
	}
}
