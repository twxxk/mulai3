const en:{[key:string]: any} = {
    character: 'Character: ',
	model: 'Model: ',
	user: 'User: ',
	ai: 'AI: ',
	system: 'System: ',
	acceptsBroadCast: 'Accepts Broadcast',
	usesCallFunctions: 'Uses Function Calls',
	childInputPlaceholder: 'Say something to this model...',
	parentInputPlaceholder: "Say something to all models...",
	imageUrlPlaceholder: 'Image URL (PNG, JPEG, WEBP, and non-animated GIF). Only works for a few models.',

	defaultModelsLabel: 'Default',
	magiModelsLabel: 'MAGI',
	optpessModelsLabel: 'Optim/Pessi',
	gptModelsLabel: 'OpenAI GPT',
	googleModelsLabel: 'Google',
	anthropicModelsLabel: 'Anthropic',
	describeImageModelsLabel: 'Describe Image',
	generateImageModelsLabel: 'Generate Image',
	randomModelsLabel: 'Random',

	surveyLabelTitle: '',
	surveyLabel: 'Survey',
	authorLabel: 'author: twk',
	mulaiTitleLabel: 'More Client Components with more models & image descriptions',
	mulai3TitleLabel: 'More RSC with function calls',

	// https://openweathermap.org/weather-conditions
	'clear sky': 'clear sky',
	'few clouds': 'few clouds',
	'scattered clouds': 'scattered clouds',
	'overcast clouds': 'overcast clouds',
	'broken clouds': 'broken clouds',
	'shower rain': 'shower rain',
	'rain': 'rain',
	'thunderstorm': 'thunderstorm',
	'snow': 'snow',
	'mist': 'mist',
} as const

const ja:{[key:string]: any} = {
    character: '性格: ',
	model: 'モデル: ',
	user: 'ユーザー: ',
	ai: 'AI: ',
	system: 'システム: ',
	acceptsBroadCast: '全体送信を利用する',
	usesCallFunctions: '関数呼び出しを利用する',
	childInputPlaceholder: 'このモデルに送信...',
	parentInputPlaceholder: "全体に送信...",
	imageUrlPlaceholder: '画像URL（PNG、JPEG、WEBP、非アニメーションGIF)。一部モデルでのみ動作します。',

	defaultModelsLabel: 'おすすめ',
	magiModelsLabel: 'MAGI',
	optpessModelsLabel: '楽観悲観',
	gptModelsLabel: 'OpenAI GPT',
	googleModelsLabel: 'Google',
	anthropicModelsLabel: 'Anthropic',
	describeImageModelsLabel: '画像説明',
	generateImageModelsLabel: '画像生成',
	randomModelsLabel: 'ランダム',

	surveyLabelTitle: 'アンケートにご協力ください',
	surveyLabel: 'アンケート',	authorLabel: '作者: twk',
	mulaiTitleLabel: 'モデル多数。画像説明あり。クライアントコンポーネント',
	mulai3TitleLabel: '関数呼び出しあり。RSC',

	'clear sky': 'はれ',
	'few clouds': 'はれ時々くもり',
	'scattered clouds': 'くもり',
	'overcast clouds': 'くもり',
	'broken clouds': 'くもり',
	'shower rain': '一時雨',
	'rain': '雨',
	'thunderstorm': '雷',
	'snow': '雪',
	'mist': '霧',
} as const

export const dictionary:{[lang:string]:{[key:string]:any}} = {en, ja}
