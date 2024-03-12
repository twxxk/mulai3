/**
 * This code was originally generated by v0 by Vercel and modified a lot.
 * @see https://v0.dev/t/TZDgA3QZrEc
 */
import { CardContent, Card } from "@/components/ui/card"
import { getTranslations } from "@/lib/localizations"
import { OpenWeatherMapResponse, OpenWeatherMapWeather } from "@/lib/open-weather-map"
import { DropletsIcon, ThermometerIcon } from "lucide-react"
import Image from 'next/image'

export function WeatherCard({locale, weather}:{locale:string, weather:OpenWeatherMapResponse}) {
  // console.log(weather)
  const {t} = getTranslations(locale)

  return (
    <Card className="w-60">
      {/* WeatherIcon has padding so we adjust paddings */}
      <CardContent className="p-4 pt-0 pr-0 grid gap-2">
        <div className="flex flex-row items-center gap-4">
          <div className="flex-1 flex flex-col whitespace-nowrap">
            <p className="text-sm font-medium tracking-wide text-gray-500 dark:text-gray-400">
              {/* city */ weather.name}</p>
            <p className="text-xl font-semibold leading-none">
              {t(weather.weather[0].description) ?? weather.weather[0].description}</p>
          </div>
          <div className="flex flex-col text-center right-0">
            <WeatherIcon weather={weather.weather[0]} size={16} />
          </div>
        </div>
        <div className="flex flex-row items-center">
          <ThermometerIcon className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
          <p className="text-sm font-medium mr-3">{weather.main.temp.toFixed(1)}°</p>
          <DropletsIcon className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
          <p className="text-sm font-medium mr-2">{weather.main.humidity}%</p>
        </div>
      </CardContent>
    </Card>
  )
}

function WeatherIcon({ weather, size }:{ weather: OpenWeatherMapWeather, size: number }) {
  const url = `http://openweathermap.org/img/wn/${weather.icon}@2x.png`
  console.log(url)
  return <Image src={url} alt={weather.description} width={size * 4} height={size * 4} className={"size-" + size} />
}
