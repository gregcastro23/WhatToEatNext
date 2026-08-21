import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MultiRetailerCartModal } from "@/components/grocery-cart/MultiRetailerCartModal";
import { instacartService } from "@/services/InstacartService";

const mockShowToast = jest.fn();
const mockCheckoutToAmazon = jest.fn().mockResolvedValue(2);

jest.mock("@/components/ToastProvider", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

jest.mock("@/contexts/GroceryCartContext", () => ({
  useGroceryCart: () => ({ checkoutToAmazon: mockCheckoutToAmazon }),
}));

jest.mock("@/services/InstacartService", () => ({
  instacartService: {
    fetchNearbyRetailers: jest.fn().mockResolvedValue([
      { retailer_key: "ret-1", name: "H Mart", retailer_logo_url: "" },
      { retailer_key: "ret-2", name: "Whole Foods", retailer_logo_url: "" },
    ]),
    createShoppingList: jest.fn().mockResolvedValue("https://www.instacart.com/test-cart"),
  },
}));


describe("MultiRetailerCartModal", () => {
  const sampleItems = [
    { name: "Galangal", quantity: 1, unit: "piece" }, // Specialty
    { name: "Whole milk", quantity: 1, unit: "gallon" }, // Commodity / staple
    { name: "Kosher salt", quantity: 1, unit: "pinch" }, // In pantry test
  ];


  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders when open with split proportions and nearby retailers", async () => {
    render(
      <MultiRetailerCartModal
        isOpen={true}
        onClose={jest.fn()}
        items={sampleItems}
        inventory={["kosher salt"]}
        title="Test Cart Split"
      />,
    );

    expect(screen.getByText("Test Cart Split")).toBeInTheDocument();
    expect(screen.getByText("Galangal")).toBeInTheDocument();
    expect(screen.getByText("Whole milk")).toBeInTheDocument();


    await waitFor(() => {
      expect(screen.getByText("H Mart")).toBeInTheDocument();
      expect(screen.getByText("Whole Foods")).toBeInTheDocument();
    });
  });

  it("dispatches specialty items to Instacart IDP URL on button click", async () => {
    const originalOpen = window.open;
    window.open = jest.fn();

    render(
      <MultiRetailerCartModal
        isOpen={true}
        onClose={jest.fn()}
        items={sampleItems}
        inventory={["kosher salt"]}
      />,
    );

    const instacartButton = screen.getByRole("button", {
      name: /Send Specialty to Instacart/i,
    });
    fireEvent.click(instacartButton);

    await waitFor(() => {
      expect(instacartService.createShoppingList).toHaveBeenCalled();
      expect(window.open).toHaveBeenCalledWith(
        "https://www.instacart.com/test-cart",
        "_blank",
      );
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining("Opening Instacart"),
        "success",
      );
    });

    window.open = originalOpen;
  });

  it("dispatches commodity staples to Amazon Fresh on button click", async () => {
    render(
      <MultiRetailerCartModal
        isOpen={true}
        onClose={jest.fn()}
        items={sampleItems}
        inventory={["kosher salt"]}
      />,
    );

    const amazonButton = screen.getByRole("button", {
      name: /Checkout Staples on Amazon Fresh/i,
    });
    fireEvent.click(amazonButton);

    await waitFor(() => {
      expect(mockCheckoutToAmazon).toHaveBeenCalledWith("fresh");
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining("Opening Amazon Fresh"),
        "success",
      );
    });
  });
});
