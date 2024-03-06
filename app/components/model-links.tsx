'use client'

import { BookMarkedIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { allModelValues } from "@/lib/ai-model";
import { DropdownMenuTrigger, DropdownMenuItem, DropdownMenuGroup, DropdownMenuContent, DropdownMenu } from "@/app/components/dropdown-menu"
import { LocaleContext, getTranslations } from "@/lib/locale-context";
import { useContext } from "react";

// true random - from all models including non-selectable models
function generateRandomUrl(pane:number) {
    const a = Array(pane).fill('').map(() => {
        const model = allModelValues[Math.floor(Math.random() * allModelValues.length)]
        // const character = characterValues[Math.floor(Math.random() * characterValues.length)]
        // const s = model + (character ? ':' + character : '')
        // console.log(s)
        const s = ''
        return s
    })
    return '/?models=' + a.join(',')
}

export default function ModelLinks({className}:{className:string}) {
    const randomUrl = generateRandomUrl(3)

    const locale = useContext(LocaleContext)
    const {t} = getTranslations(locale)
    
    return (
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={className}>
          <BookMarkedIcon />
            <span className="sr-only">Links</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem>
                <a className="size-full" href="/">{t('defaultModelsLabel')}</a>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <a className="size-full" href="/?models=magi">{t('magiModelsLabel')}</a>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <a className="size-full" href="/?models=optpess">{t('optpessModelsLabel')}</a>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <a className="size-full" href="/?models=describeimage">{t('describeImageModelsLabel')}</a>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <a className="size-full" href="/?models=gpt">{t('gptModelsLabel')}</a>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <a className="size-full" href="/?models=google">{t('googleModelsLabel')}</a>
            </DropdownMenuItem>
            <DropdownMenuItem>
                <a className="size-full" href="/?models=anthropic">{t('anthropicModelsLabel')}</a>
            </DropdownMenuItem>
            {process.env.NODE_ENV === 'development' ? (
              <DropdownMenuItem>
                <a className="size-full" href="/?models=generateimage">{t('generateImageModelsLabel')}</a>
              </DropdownMenuItem>
            ) : ''}
            <DropdownMenuItem>
                <a className="size-full" href={randomUrl} suppressHydrationWarning={true}>
                {t('randomModelsLabel')}</a>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>  
    )    
}
