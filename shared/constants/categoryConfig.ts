export type CategoryConfig = {
  showSizes?: boolean;
  showSareeType?: boolean;
  showBlouseMaterialType?: boolean;
  showLengthWidth?: boolean;
  showReadyBlouseType?: boolean;
};

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  Sarees: {
    showSizes: false,
    showSareeType: true,
  },

  "Blouse Materials": {
    showSizes: false,
    showBlouseMaterialType: true,
    showLengthWidth: true,
  },

  "Ready Made Blouses": {
    showSizes: false,
    showReadyBlouseType: true,
  },

  Novelties: {
    showSizes: false,
  },

  Stationery: {
    showSizes: false,
  },
};
