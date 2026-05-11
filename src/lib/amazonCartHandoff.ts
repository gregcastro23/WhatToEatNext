import type {
  CheckoutPreflightItem,
  CheckoutPreflightResponse,
  CheckoutPreflightSource,
} from "@/types/checkout";

export async function preflightAndSubmitAmazonCart({
  items,
  source,
  metadata,
}: {
  items: CheckoutPreflightItem[];
  source: CheckoutPreflightSource;
  metadata?: Record<string, unknown>;
}): Promise<CheckoutPreflightResponse> {
  const reservedTarget = reserveCheckoutTarget();

  let response: Response;
  try {
    response = await fetch("/api/checkout/preflight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, source, metadata }),
    });
  } catch (error) {
    reservedTarget?.close();
    throw error;
  }

  const body = (await response.json().catch(() => null)) as
    | (Partial<CheckoutPreflightResponse> & { error?: string })
    | null;

  if (!response.ok || !body?.success || !body.payload || !body.formAction) {
    reservedTarget?.close();
    throw new Error(body?.error || `Checkout preflight failed (${response.status})`);
  }

  submitAmazonCartPayload({
    action: body.formAction,
    method: body.method ?? "POST",
    target: reservedTarget?.name ?? body.target ?? "_blank",
    payload: body.payload,
  });

  return body as CheckoutPreflightResponse;
}

function reserveCheckoutTarget(): { name: string; close: () => void } | null {
  if (typeof window === "undefined") return null;

  const name = `amazon_fresh_cart_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 9)}`;
  const checkoutWindow = window.open("about:blank", name);

  if (!checkoutWindow) return null;
  checkoutWindow.opener = null;

  return {
    name,
    close: () => {
      checkoutWindow.close();
    },
  };
}

function submitAmazonCartPayload({
  action,
  method,
  target,
  payload,
}: {
  action: string;
  method: "POST";
  target: string;
  payload: Record<string, string>;
}) {
  if (typeof document === "undefined") return;

  const form = document.createElement("form");
  form.method = method;
  form.action = action;
  form.target = target;
  form.rel = "noopener noreferrer";
  form.style.display = "none";

  Object.entries(payload).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
