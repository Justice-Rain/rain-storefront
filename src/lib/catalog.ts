export type LaptopPlatform = "macos" | "windows";

export type LaptopCategory = "mac" | "windows";

export const CATEGORY_LABEL: Record<LaptopCategory, string> = {
  mac: "Mac",
  windows: "Windows",
};

export type TeamStandard = "Operations" | "Engineering";

export type LaptopConfig = {
  id: string;
  platform: LaptopPlatform;
  category: LaptopCategory;
  brand: string;
  modelLine: string;
  display: string;
  chip: string;
  memory: string;
  storage: string;
  /** Marks this laptop as the standard for a given team. */
  teamStandard?: TeamStandard | null;
  /** Optional list price in USD. */
  priceUsd?: number | null;
  /** Optional vendor configurator URL. */
  productUrl?: string | null;
};

export const laptops: LaptopConfig[] = [
  {
    id: "macbook-air-m3-standard",
    platform: "macos",
    category: "mac",
    brand: "MacBook Air",
    modelLine: '13" · Apple M3',
    display: '13.6" Liquid Retina',
    chip: "Apple M3",
    memory: "16 GB",
    storage: "512 GB",
    teamStandard: "Operations",
  },
  {
    id: "macbook-pro-14-16",
    platform: "macos",
    category: "mac",
    brand: "MacBook Pro",
    modelLine: '14" or 16" · Apple M4 Pro',
    display: '14" or 16" Liquid Retina XDR',
    chip: "Apple M4 Pro",
    memory: "48 GB",
    storage: "1 TB",
    teamStandard: "Engineering",
  },
  {
    id: "microsoft-surface-laptop",
    platform: "windows",
    category: "windows",
    brand: "Surface Laptop",
    modelLine: "Snapdragon X Elite (12 Core) · Black",
    display: '13.8" PixelSense touch',
    chip: "Snapdragon X Elite (12 Core)",
    memory: "32 GB",
    storage: "1 TB",
    priceUsd: 2849.99,
  },
  {
    id: "lenovo-thinkpad-p1-gen-8",
    platform: "windows",
    category: "windows",
    brand: "Lenovo ThinkPad P1",
    modelLine: 'Gen 8 · 16" mobile workstation',
    display: '16" WUXGA (1920×1200) IPS',
    chip: "Intel Core Ultra 7 255H",
    memory: "32 GB LPDDR5x",
    storage: "1 TB",
    productUrl:
      "https://www.lenovo.com/us/en/configurator/cto/?bundleId=21Q8CTO1WWUS2",
  },
];

export const standardLaptops = laptops.filter((l) => l.teamStandard);

export function laptopsInCategory(category: LaptopCategory): LaptopConfig[] {
  return laptops.filter((l) => l.category === category);
}
