"use client";

import SelectorCover from "./SelectorCover";
import SelectorGrid from "./SelectorGrid";

export default function MotionSelector() {
  return (
    <>
      <div className="mb-4">
        <SelectorCover type="motion" />
      </div>
      <SelectorGrid type="motion" />
    </>
  );
}
