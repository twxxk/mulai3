'use client'

import { eventBus, EventName } from "@/lib/event-emitter"
import { getTranslations, LocaleContext } from "@/lib/locale-context";
import { useContext, useState } from "react";

export default function Broadcast() {
	const locale = useContext(LocaleContext)
    const {t} = getTranslations(locale)

    const [broadcastText, setBroadcastText] = useState('')

    return (<form onSubmit={async (e) => {
            e.preventDefault();
            eventBus.emit(EventName.onSubmitBroadcastMessage, broadcastText);
            setBroadcastText('')
        }}>
        <input
            placeholder={t('parentInputPlaceholder')}
            className="w-96"
            value={broadcastText}
            onChange={(event) => {
            const newValue = event.target.value
            setBroadcastText(newValue)
            eventBus.emit(EventName.onChangeBroadcastMessage, newValue);
           }}
        />
    </form>
    )
}