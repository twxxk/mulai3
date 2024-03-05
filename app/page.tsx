import { useState } from 'react';
import { useUIState, useActions } from "ai/rsc";
import { AI } from "./action";
import ChatPage from './components/chat-page'

export default function Page() {
  return (<div className='flex w-screen flex-row'>
    <AI>
      <ChatPage className="flex-1" />
    </AI>
    <AI>
      <ChatPage className='flex-1'/>
    </AI>
  </div>)
}
