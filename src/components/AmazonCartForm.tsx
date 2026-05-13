"use client";

import { useState } from "react";
import { AMAZON_CONFIG } from "@/lib/amazon/config";

interface CartItem {
  asin: string;
  quantity: number;
  name?: string;
}

interface AmazonCartFormProps {
  items: CartItem[];
  associateTag?: string;
}

const AMAZON_CART_URL = "https://www.amazon.com/gp/aws/cart/add.html";

export function AmazonCartForm({
  items,
  associateTag = AMAZON_CONFIG.tag,
}: AmazonCartFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const validItems = items.filter((item) => item.asin && item.quantity > 0);

  if (validItems.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        No ingredients available for Amazon ordering.
      </p>
    );
  }

  return (
    <form
      method="POST"
      action={AMAZON_CART_URL}
      target="_blank"
      rel="noopener noreferrer"
      onSubmit={() => setSubmitted(true)}
    >
      <input type="hidden" name="AssociateTag" value={associateTag} />
      <input type="hidden" name="cart-type" value="fresh" />
      <input type="hidden" name="add" value="add" />
      <input type="hidden" name="submit.add" value="1" />

      {validItems.map((item, idx) => {
        const position = idx + 1;
        return (
          <div key={item.asin}>
            <input type="hidden" name={`ASIN.${position}`} value={item.asin} />
            <input
              type="hidden"
              name={`Quantity.${position}`}
              value={item.quantity}
            />
          </div>
        );
      })}

      <div className="space-y-3">
        {validItems.length > 0 && (
          <p className="text-xs text-gray-400">
            {validItems.length} ingredient{validItems.length !== 1 ? "s" : ""}{" "}
            will be added to your Amazon cart
          </p>
        )}

        <button
          type="submit"
          disabled={submitted}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-600 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitted ? (
            <>
              <CheckIcon />
              Sent to Amazon
            </>
          ) : (
            <>
              <CartIcon />
              Add to Amazon Cart
            </>
          )}
        </button>

        {submitted && (
          <p className="text-xs text-green-600">
            A new tab opened with your Amazon cart. Didn&apos;t work?{" "}
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="underline hover:text-green-800"
            >
              Try again
            </button>
          </p>
        )}
      </div>
    </form>
  );
}

function CartIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
