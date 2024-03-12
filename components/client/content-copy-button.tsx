"use client";

import { ClipboardCopyIcon } from 'lucide-react';

// Client Component only
export default function ContentCopyButton({text}:{text:string}) {
    const handleClick = () => {
      navigator.clipboard.writeText(text);
    }
    return (
      <button onClick={handleClick} className="text-teal-600 enabled:hover:text-teal-500 enabled:active:text-teal-100">
        <ClipboardCopyIcon className="h-5 w-5" />
        <span className='sr-only'>Copy</span>
      </button>
    )
}
