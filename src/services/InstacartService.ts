import { GroceryItem } from "@/types/menuPlanner";
import { createLogger } from "@/utils/logger";

const logger = createLogger("InstacartService");

export type ElementalElement = "Earth" | "Air" | "Fire" | "Water";

export interface InstacartRetailer {
  id: string;
  name: string;
  distance?: number;
  elementalTag: ElementalElement;
  description: string;
}

class InstacartService {
  private static instance: InstacartService;
  private apiKey: string = process.env.NEXT_PUBLIC_INSTACART_API_KEY || "";
  private partnerId: string = process.env.NEXT_PUBLIC_IMPACT_PARTNER_ID || "";
  private scriptLoaded: boolean = false;

  private constructor() {
    this.validateConfig();
  }

  public static getInstance(): InstacartService {
    if (!InstacartService.instance) {
      InstacartService.instance = new InstacartService();
    }
    return InstacartService.instance;
  }

  /**
   * Validates production environment variables
   */
  private validateConfig() {
    if (!this.apiKey) {
      logger.warn("NEXT_PUBLIC_INSTACART_API_KEY is missing. Widget initialization may fail.");
    }
    if (!this.partnerId) {
      logger.warn("NEXT_PUBLIC_IMPACT_PARTNER_ID is missing. Affiliate tracking will not be active.");
    }
  }

  /**
   * Dynamically loads the Instacart IDP Widget script
   */
  public async loadScript(): Promise<boolean> {
    if (this.scriptLoaded) return true;
    if (typeof window === 'undefined') return false;

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = "https://www.instacart.com/developer/idp.js";
      script.async = true;
      script.onload = () => {
        this.scriptLoaded = true;
        logger.info("Instacart IDP script loaded successfully.");
        resolve(true);
      };
      script.onerror = () => {
        logger.error("Failed to load Instacart IDP script.");
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Forest Hills (11375) Optimized Retailer Mapping
   * Maps local retailers to Alchm "Elements"
   */
  public getLocalRetailers(zipCode: string = "11375"): InstacartRetailer[] {
    logger.info(`Fetching local retailers for zip: ${zipCode}`);
    // In production, this calls GET /v1/retailers?zip={zipCode}
    // Hardcoded mapping for Forest Hills initial launch:
    return [
      {
        id: "aldi_rego_park",
        name: "Aldi",
        elementalTag: "Earth",
        description: "Grounding, essential staples for the foundational kitchen.",
      },
      {
        id: "costco_lic",
        name: "Costco",
        elementalTag: "Fire",
        description: "Abundance and expansion for high-energy feast planning.",
      },
      {
        id: "whole_foods_union_turnpike",
        name: "Whole Foods",
        elementalTag: "Water",
        description: "Pure, organic flows for cleansing and high-vibration meals.",
      }
    ];
  }

  /**
   * Generates the Production Handoff URL with Affiliate Tracking
   */
  public generateShoppableUrl(items: GroceryItem[], retailerId: string): string {
    const baseUrl = "https://instacart.com";
    
    // Map internal items to Instacart Universal Product Codes or Strings
    const productList = items.map(item => encodeURIComponent(`${item.quantity} ${item.unit} ${item.ingredient}`)).join(',');
    
    // Build the Impact.com Affiliate String
    const affiliateParams = `utm_source=instacart_idp&utm_medium=affiliate&partnerid=${this.partnerId}&utm_campaign=alchm_kitchen_planner`;

    const finalUrl = `${baseUrl}/${retailerId}?items=${productList}&${affiliateParams}`;
    logger.info(`Generated shoppable URL for retailer: ${retailerId}`, { itemCount: items.length });
    
    return finalUrl;
  }

  /**
   * Initializes the Instacart "Shop the Recipe" Widget
   * To be called in a useEffect on the Menu Planner page
   */
  public async initProductionWidget(containerId: string, recipeId: string) {
    if (typeof window === 'undefined') return;

    const ready = await this.loadScript();
    if (ready && (window as any).Instacart) {
      logger.info(`Initializing Instacart Widget for recipe: ${recipeId}`);
      (window as any).Instacart.Widgets.RecipeButton({
        containerId: containerId,
        recipeId: recipeId,
        affiliateId: this.partnerId,
        onAddToCart: (item: any) => {
          logger.info(`Alchemical item added via widget: ${item.name}`);
        }
      });
    }
  }

  /**
   * Mock for Order Status Webhook Handler
   */
  public handleOrderUpdate(payload: any) {
    const { status, eta } = payload;
    logger.info(`Order update received: ${status}`, { eta });
    
    if (status === "out_for_delivery") {
      return {
        onBrandMessage: `Your Alchemical ingredients are manifesting! Arriving in ${eta} minutes.`,
        vibration: "high"
      };
    }
    return null;
  }
}

export const instacartService = InstacartService.getInstance();
