'use client'

import { eventBus, EventName } from "@/lib/event-emitter"
import { useState } from "react";

export default function Broadcast() {
    const [broadcastText, setBroadcastText] = useState('')

    return (<form onSubmit={async (e) => {
            e.preventDefault();
            eventBus.emit(EventName.onSubmitBroadcastMessage, broadcastText);
            // setBroadcastText('')
        }}>
        <input
           placeholder="Send a message..."
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