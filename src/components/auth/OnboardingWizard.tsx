// src/components/auth/OnboardingWizard.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod"; // For validation
import { useForm } from "react-hook-form"; // For form management
import { zodResolver } from "@hookform/resolvers/zod"; // For integrating zod with react-hook-form

// Assuming these types are defined elsewhere (e.g., src/types/auth.ts, src/types/chart.ts)
interface UserIdentity {
  email: string;
  password: string;
  confirmPassword?: string;
}

interface BirthData {
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM (24-hour format)
  birthLatitude: number;
  birthLongitude: number;
  timezone: string;
}

interface KitchenPreferences {
  thermodynamicDefaults: string; // e.g., "neutral", "warming", "cooling"
  kineticDefaults: string; // e.g., "gentle", "moderate", "intense"
}

// Zod schemas for validation
const IdentitySchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const BirthDataSchema = z.object({
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  birthLatitude: z
    .number()
    .min(-90)
    .max(90, "Latitude must be between -90 and 90"),
  birthLongitude: z
    .number()
    .min(-180)
    .max(180, "Longitude must be between -180 and 180"),
  timezone: z.string().min(1, "Timezone is required"),
});

const KitchenPreferencesSchema = z.object({
  thermodynamicDefaults: z.enum(["neutral", "warming", "cooling"]),
  kineticDefaults: z.enum(["gentle", "moderate", "intense"]),
});

type IdentityForm = z.infer<typeof IdentitySchema>;
type BirthDataForm = z.infer<typeof BirthDataSchema>;
type KitchenPreferencesForm = z.infer<typeof KitchenPreferencesSchema>;

const STEPS = ["Identity", "Birth Data", "Kitchen Preferences"];

export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    identity: {} as IdentityForm,
    birthData: {} as BirthDataForm,
    kitchenPreferences: {} as KitchenPreferencesForm,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // React Hook Form setup for each step
  const {
    handleSubmit: handleSubmitIdentity,
    register: registerIdentity,
    formState: { errors: errorsIdentity },
    trigger: triggerIdentity,
  } = useForm<IdentityForm>({
    resolver: zodResolver(IdentitySchema),
    defaultValues: formData.identity,
  });

  const {
    handleSubmit: handleSubmitBirthData,
    register: registerBirthData,
    formState: { errors: errorsBirthData },
    trigger: triggerBirthData,
  } = useForm<BirthDataForm>({
    resolver: zodResolver(BirthDataSchema),
    defaultValues: formData.birthData,
  });

  const {
    handleSubmit: handleSubmitKitchenPreferences,
    register: registerKitchenPreferences,
    formState: { errors: errorsKitchenPreferences },
    trigger: triggerKitchenPreferences,
  } = useForm<KitchenPreferencesForm>({
    resolver: zodResolver(KitchenPreferencesSchema),
    defaultValues: formData.kitchenPreferences,
  });

  const handleNext = async (data: any) => {
    setError(null);
    let isValid = false;

    if (currentStep === 0) {
      isValid = await triggerIdentity();
      if (isValid) {
        setFormData((prev) => ({ ...prev, identity: data }));
        setCurrentStep(1);
      }
    } else if (currentStep === 1) {
      isValid = await triggerBirthData();
      if (isValid) {
        setFormData((prev) => ({ ...prev, birthData: data }));
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      isValid = await triggerKitchenPreferences();
      if (isValid) {
        setFormData((prev) => ({ ...prev, kitchenPreferences: data }));
        // This is the final step, submit to backend
        await submitOnboarding(data);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const submitOnboarding = async (finalData: KitchenPreferencesForm) => {
    setIsLoading(true);
    setError(null);

    const payload = {
      email: formData.identity.email,
      password: formData.identity.password,
      birthData: {
        birthDate: formData.birthData.birthDate,
        birthTime: formData.birthData.birthTime,
        birthLatitude: formData.birthData.birthLatitude,
        birthLongitude: formData.birthData.birthLongitude,
        timezone: formData.birthData.timezone,
      },
      kitchenPreferences: {
        thermodynamicDefaults: finalData.thermodynamicDefaults,
        kineticDefaults: finalData.kineticDefaults,
      },
    };

    try {
      // Assuming an API endpoint for user registration and chart creation
      const response = await fetch("/api/auth/register-alchemist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Onboarding failed");
      }

      // Onboarding successful, redirect to dashboard or home
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError(
        err.message || "An unexpected error occurred during onboarding.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <form
            onSubmit={handleSubmitIdentity(handleNext)}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold">
              1. Your Alchemical Identity
            </h2>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                {...registerIdentity("email")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errorsIdentity.email && (
                <p className="mt-2 text-sm text-red-600">
                  {errorsIdentity.email.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                {...registerIdentity("password")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errorsIdentity.password && (
                <p className="mt-2 text-sm text-red-600">
                  {errorsIdentity.password.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                {...registerIdentity("confirmPassword")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errorsIdentity.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {errorsIdentity.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Next: Birth Data
              </button>
            </div>
          </form>
        );
      case 1:
        return (
          <form
            onSubmit={handleSubmitBirthData(handleNext)}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold">
              2. Your Celestial Calibration
            </h2>
            <p className="text-sm text-gray-600">
              Precise birth details are crucial for accurate alchemical
              calculations.
            </p>
            <div>
              <label
                htmlFor="birthDate"
                className="block text-sm font-medium text-gray-700"
              >
                Birth Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                id="birthDate"
                {...registerBirthData("birthDate")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errorsBirthData.birthDate && (
                <p className="mt-2 text-sm text-red-600">
                  {errorsBirthData.birthDate.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="birthTime"
                className="block text-sm font-medium text-gray-700"
              >
                Birth Time (HH:MM - 24hr)
              </label>
              <input
                type="time"
                id="birthTime"
                {...registerBirthData("birthTime")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errorsBirthData.birthTime && (
                <p className="mt-2 text-sm text-red-600">
                  {errorsBirthData.birthTime.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="birthLatitude"
                className="block text-sm font-medium text-gray-700"
              >
                Birth Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                id="birthLatitude"
                {...registerBirthData("birthLatitude", { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errorsBirthData.birthLatitude && (
                <p className="mt-2 text-sm text-red-600">
                  {errorsBirthData.birthLatitude.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="birthLongitude"
                className="block text-sm font-medium text-gray-700"
              >
                Birth Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                id="birthLongitude"
                {...registerBirthData("birthLongitude", {
                  valueAsNumber: true,
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errorsBirthData.birthLongitude && (
                <p className="mt-2 text-sm text-red-600">
                  {errorsBirthData.birthLongitude.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="timezone"
                className="block text-sm font-medium text-gray-700"
              >
                Timezone (e.g., America/New_York)
              </label>
              <input
                type="text"
                id="timezone"
                {...registerBirthData("timezone")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="America/New_York"
              />
              {errorsBirthData.timezone && (
                <p className="mt-2 text-sm text-red-600">
                  {errorsBirthData.timezone.message}
                </p>
              )}
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Back
              </button>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Next: Preferences
              </button>
            </div>
          </form>
        );
      case 2:
        return (
          <form
            onSubmit={handleSubmitKitchenPreferences(handleNext)}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold">
              3. Your Kitchen Preferences
            </h2>
            <p className="text-sm text-gray-600">
              Set your default alchemical approach to cooking.
            </p>
            <div>
              <label
                htmlFor="thermodynamicDefaults"
                className="block text-sm font-medium text-gray-700"
              >
                Thermodynamic Default
              </label>
              <select
                id="thermodynamicDefaults"
                {...registerKitchenPreferences("thermodynamicDefaults")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="neutral">Neutral</option>
                <option value="warming">Warming</option>
                <option value="cooling">Cooling</option>
              </select>
              {errorsKitchenPreferences.thermodynamicDefaults && (
                <p className="mt-2 text-sm text-red-600">
                  {errorsKitchenPreferences.thermodynamicDefaults.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="kineticDefaults"
                className="block text-sm font-medium text-gray-700"
              >
                Kinetic Default
              </label>
              <select
                id="kineticDefaults"
                {...registerKitchenPreferences("kineticDefaults")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="gentle">Gentle</option>
                <option value="moderate">Moderate</option>
                <option value="intense">Intense</option>
              </select>
              {errorsKitchenPreferences.kineticDefaults && (
                <p className="mt-2 text-sm text-red-600">
                  {errorsKitchenPreferences.kineticDefaults.message}
                </p>
              )}
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Back
              </button>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                disabled={isLoading}
              >
                {isLoading ? "Enchanting..." : "Complete Onboarding"}
              </button>
            </div>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center">
          Alchemist Onboarding Wizard
        </h1>
        <div className="mt-4 flex justify-between text-sm font-medium text-gray-500">
          {STEPS.map((step, index) => (
            <span
              key={step}
              className={`pb-1 ${
                index === currentStep
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : ""
              }`}
            >
              {step}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {renderStepContent()}
    </div>
  );
}
