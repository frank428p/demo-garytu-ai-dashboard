"use client";

import SelectorCover from "./SelectorCover";
import SelectorGrid from "./SelectorGrid";

export default function MovementSelector() {
  return (
    <>
      <div className="mb-4">
        <SelectorCover type="movement" />
      </div>
      <SelectorGrid type="movement" />
    </>
  );
}
