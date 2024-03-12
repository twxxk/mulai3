import { dictionary } from "@/app/locales/dictionary"

export function getTranslations(locale:string) {
	const t = (key:string) => {
		if (process.env.NODE_ENV === 'development' && !dictionary[locale][key])
			console.warn('translation not found. key:', key, locale)
		return dictionary[locale][key] ?? key
	};
	return { t };
}
