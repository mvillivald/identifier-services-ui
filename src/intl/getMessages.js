import {translations} from '../intl/translations';

export function getMessages(locale) {
	const messages = translations[locale];
	if (!messages) {
		return {};
	}

	if (Object.keys(messages).length === 1 && 'default' in messages) {
		return messages.default;
	}

	return messages;
}
