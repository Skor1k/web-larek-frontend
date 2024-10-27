export const API_URL = `${process.env.API_ORIGIN}/api/weblarek`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek`;

export const settings = {};

export const categories = new Map([
	['софт-скилл', 'card__category_soft'],
	['хард-скилл', 'card__category_hard'],
	['дополнительное', 'card__category_additional'],
	['кнопка', 'card__category_button'],
  ['другое', 'card__category_other']
]);
