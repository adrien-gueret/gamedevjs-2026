import type { DevilDeal } from "@/types/game";

const ALL_DEVIL_DEALS: DevilDeal[] = [
  { type: "betterBet1", cost: { value: 2, type: "gold" }, permanent: true },
  {
    type: "betterBet2",
    cost: { value: 12, type: "gold" },
    requirements: ["betterBet1"],
    permanent: true,
  },
  {
    type: "lockReel",
    cost: { value: 6, type: "gold" },
    requirements: ["betterBet2"],
    permanent: true,
  },
  {
    type: "unlockRerollDeals",
    cost: { value: 8, type: "gold" },
    requirements: ["betterBet1"],
    permanent: true,
  },
  {
    type: "moreHealth1",
    cost: { value: 4, type: "gold" },
    permanent: true,
  },
  {
    type: "moreHealth2",
    cost: { value: 8, type: "gold" },
    requirements: ["moreHealth1"],
    permanent: true,
  },
  {
    type: "moreHealth3",
    cost: { value: 10, type: "gold" },
    requirements: ["moreHealth2"],
    permanent: true,
  },
  {
    type: "unlockSkeleton",
    cost: { value: 12, type: "gold" },
    requirements: ["moreHealth1"],
    permanent: true,
  },
  {
    type: "unlockWizard",
    cost: { value: 15, type: "gold" },
    requirements: ["unlockSkeleton", "moreHealth2"],
    permanent: true,
  },
  {
    type: "unlockRandom",
    cost: { value: 10, type: "gold" },
    permanent: true,
  },
  {
    type: "superHeart",
    cost: { value: 15, type: "gold" },
    requirements: ["moreHealth3"],
    permanent: true,
  },
  {
    type: "superCoin",
    cost: { value: 15, type: "gold" },
    requirements: ["lockReel"],
    permanent: true,
  },
  {
    type: "superSword",
    cost: { value: 15, type: "gold" },
    requirements: ["unlockWizard"],
    permanent: true,
  },
  {
    type: "superShield",
    cost: { value: 15, type: "gold" },
    requirements: ["unlockSkeleton"],
    permanent: true,
  },
  {
    type: "destroyReelSymbol",
    cost: [
      { value: 5, type: "maxhealth" },
      { value: 8, type: "health" },
      { value: 4, type: "gold" },
      { value: 2, type: "reel" },
    ],
    permanent: false,
  },
  {
    type: "replaceReelSymbol",
    cost: [
      { value: 3, type: "maxhealth" },
      { value: 5, type: "health" },
      { value: 2, type: "gold" },
      { value: 2, type: "reel" },
    ],
    permanent: false,
  },
  {
    type: "passiveDefense",
    cost: [
      { value: 5, type: "maxhealth" },
      { value: 9, type: "health" },
      { value: 4, type: "gold" },
      { value: 1, type: "reel" },
    ],
    permanent: false,
  },
  {
    type: "passiveAttack",
    cost: [
      { value: 5, type: "maxhealth" },
      { value: 9, type: "health" },
      { value: 4, type: "gold" },
      { value: 1, type: "reel" },
    ],
    permanent: false,
  },
  {
    type: "passiveWantedToDie",
    cost: [{ value: 10, type: "health" }],
    permanent: false,
  },
];

export const PERMANENT_DEVIL_DEALS = ALL_DEVIL_DEALS.filter(
  (deal) => deal.permanent,
);

export const RUN_ONLY_DEVIL_DEALS = ALL_DEVIL_DEALS.filter(
  (deal) => !deal.permanent,
);
