// api/keys.js

const REMOVE_BG_KEYS = [
  "EgZ7irjmiMxb1fNk1qknkGWa",
  "ELQQQH5A9CeXUEdNn3qMUMid",
  "vmtF2DbpBRAnsabaCrymtq4T"
];

let currentKeyIndex = 0;

// Rotate through keys sequentially (round-robin) each time background removal is called
export function getNextRemoveBgKey() {
  const key = REMOVE_BG_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % REMOVE_BG_KEYS.length;
  return key;
}
