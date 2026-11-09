"use client";

import React, { useState } from "react";
import { z } from "zod";
import { fromLiveFlag } from "@/components/admin/kit/provenance";
import { ProvenanceBadge } from "@/components/admin/kit/ProvenanceBadge";
import { readJson } from "@/lib/api/json";

export interface EmailServiceStatus {
  configured: boolean;
  message: string;
}

export const EmailStatusResponseSchema = z
  .object({
    configured: z.boolean().optional(),
    message: z.string().optional(),
  })
  .passthrough();

export const SendTestEmailResponseSchema = z
  .object({
    success: z.boolean().optional(),
    message: z.string().optional(),
    error: z.string().optional(),
  })
  .passthrough();

type EmailType = "welcome" | "admin" | "login" | "bulletin";
type ElementType = "Fire" | "Water" | "Earth" | "Air";

function isEmailType(v: string): v is EmailType {
  return v === "welcome" || v === "admin" || v === "login" || v === "bulletin";
}

function isElement(v: string): v is ElementType {
  return v === "Fire" || v === "Water" || v === "Earth" || v === "Air";
}

async function sendTestEmailRequest(body: Record<string, string>): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch("/api/admin/send-test-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await readJson(res, { parse: (raw) => SendTestEmailResponseSchema.parse(raw) });
    const msg = res.ok && payload.success ? (payload.message ?? "Test email dispatched.") : (payload.error ?? payload.message ?? "Failed to send.");
    return { ok: res.ok && Boolean(payload.success), message: msg };
  } catch {
    return { ok: false, message: "Network error sending test email." };
  }
}

function EmailInputs({
  emailTo,
  name,
  onEmailChange,
  onNameChange,
}: {
  emailTo: string;
  name: string;
  onEmailChange: (v: string) => void;
  onNameChange: (v: string) => void;
}): React.JSX.Element {
  return (
    <>
      <div>
        <label htmlFor="test-email-to" className="block text-xs font-medium text-gray-600 mb-1">
          Recipient Email (optional override)
        </label>
        <input
          id="test-email-to"
          type="email"
          value={emailTo}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="Default admin email"
          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <div>
        <label htmlFor="test-email-name" className="block text-xs font-medium text-gray-600 mb-1">
          Recipient Name
        </label>
        <input
          id="test-email-name"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
        />
      </div>
    </>
  );
}

function EmailSelects({
  type,
  element,
  onTypeChange,
  onElementChange,
}: {
  type: EmailType;
  element: ElementType;
  onTypeChange: (v: EmailType) => void;
  onElementChange: (v: ElementType) => void;
}): React.JSX.Element {
  return (
    <>
      <div>
        <label htmlFor="test-email-type" className="block text-xs font-medium text-gray-600 mb-1">
          Template Type
        </label>
        <select
          id="test-email-type"
          value={type}
          onChange={(e) => { if (isEmailType(e.target.value)) onTypeChange(e.target.value); }}
          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="welcome">Welcome Onboarding</option>
          <option value="admin">Admin Signup Alert</option>
          <option value="login">Login Security Alert</option>
          <option value="bulletin">Personalized Bulletin</option>
        </select>
      </div>
      <div>
        <label htmlFor="test-email-element" className="block text-xs font-medium text-gray-600 mb-1">
          Dominant Element
        </label>
        <select
          id="test-email-element"
          value={element}
          onChange={(e) => { if (isElement(e.target.value)) onElementChange(e.target.value); }}
          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="Fire">Fire</option>
          <option value="Water">Water</option>
          <option value="Earth">Earth</option>
          <option value="Air">Air</option>
        </select>
      </div>
    </>
  );
}

function EmailTestForm({
  onFeedback,
  busy,
  setBusy,
}: {
  onFeedback: (msg: string) => void;
  busy: boolean;
  setBusy: (v: boolean) => void;
}): React.JSX.Element {
  const [testEmailTo, setTestEmailTo] = useState("");
  const [testEmailName, setTestEmailName] = useState("Operator Check");
  const [testEmailType, setTestEmailType] = useState<EmailType>("welcome");
  const [testEmailElement, setTestEmailElement] = useState<ElementType>("Fire");

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setBusy(true);
    const body: Record<string, string> = {
      name: testEmailName.trim() || "Operator Check",
      type: testEmailType,
      dominantElement: testEmailElement,
    };
    if (testEmailTo.trim()) body.to = testEmailTo.trim();
    sendTestEmailRequest(body)
      .then((res) => { onFeedback(res.message); })
      .catch(() => {})
      .finally(() => { setBusy(false); });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
      <EmailInputs emailTo={testEmailTo} name={testEmailName} onEmailChange={setTestEmailTo} onNameChange={setTestEmailName} />
      <EmailSelects type={testEmailType} element={testEmailElement} onTypeChange={setTestEmailType} onElementChange={setTestEmailElement} />
      <div>
        <button type="submit" disabled={busy} className="w-full px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium disabled:opacity-50">
          {busy ? "Sending…" : "Send Test Email"}
        </button>
      </div>
    </form>
  );
}

export function EmailTestPanel({
  emailStatus,
  emailLive,
}: {
  emailStatus: EmailServiceStatus | null;
  emailLive: boolean;
}): React.JSX.Element {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Email Delivery &amp; Template Verification</h2>
          <p className="text-xs text-gray-500 mt-0.5">Live transport status via /api/admin/send-test-email</p>
        </div>
        <div className="flex items-center gap-2">
          {emailStatus && (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${emailStatus.configured ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
              {emailStatus.configured ? "Transport Configured" : "Transport Unconfigured"}
            </span>
          )}
          <ProvenanceBadge provenance={fromLiveFlag(emailLive)} compact />
        </div>
      </div>
      <div className="p-6 space-y-4">
        {emailStatus && <p className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg p-3">{emailStatus.message}</p>}
        <EmailTestForm onFeedback={setFeedback} busy={busy} setBusy={setBusy} />
        {feedback && <p className="text-xs font-medium text-purple-800">{feedback}</p>}
      </div>
    </div>
  );
}
