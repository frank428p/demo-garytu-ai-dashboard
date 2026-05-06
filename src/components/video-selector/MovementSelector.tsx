"use client";

import SelectorCover from "./SelectorCover";
import SelectorGrid from "./SelectorGrid";

export default function MovementSelector() {
  return (
    <>
      <SelectorCover type="movement" />
      <SelectorGrid type="movement" />
    </>
  );
}
