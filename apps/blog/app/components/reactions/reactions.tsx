"use client";

import { useState } from "react";

export function Reactions() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" data-testid="reactions" onClick={() => setCount((c) => c + 1)}>
      Like · {count}
    </button>
  );
}
