# Sibling Realm Privy Integration Specification (WTEN)

This document outlines the detailed engineering steps required to integrate Privy into the **WhatToEatNext (WTEN)** sibling application. 

By utilizing the **same Privy App ID** across both sites, users will be assigned the same Decentralized Identifier (DID) on both domains. This shared DID allows us to unify user profiles, records, streaks, and token transaction histories across alchm.kitchen and WTEN.

---

## 1. Database Schema Changes (Prisma)

Unlike alchm.kitchen which uses raw SQL (`pg`), WTEN uses Prisma for database access. Add the `privyDid` column to the `User` model in `prisma/schema.prisma`.

### Modify `prisma/schema.prisma`

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  // ... other existing fields ...
  
  // Privy Decentralized Identifier mapping
  privyDid      String?   @unique @map("privy_did")
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  @@map("users")
}
```

### Apply Migration & Generate Client

Run the following commands in the WTEN root directory using Bun:

```bash
# Generate the SQL migration and apply it to the database
bunx prisma migrate dev --name add_privy_did

# Re-generate the Prisma Client to include privyDid typings
bunx prisma generate
```

---

## 2. Shared Client-Side Provider Setup

To guarantee that a user logging into both WTEN and alchm.kitchen generates the **identical DID**, you **MUST** mount the client-side `PrivyProvider` with the exact same Privy App ID.

### Environment Variable Setup (`.env.local`)
Add the public App ID:
```env
NEXT_PUBLIC_PRIVY_APP_ID=your-shared-privy-app-id-here
```

### Mount PrivyProvider
Wrap the WTEN application layout or provider tree (e.g. `src/app/providers.tsx` or `src/pages/_app.tsx`):

```typescript
import { PrivyProvider } from "@privy-io/react-auth";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "your-shared-privy-app-id-here";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ["email", "wallet", "google"],
        appearance: {
          theme: "dark",
          accentColor: "#805ad5", // Match Alchm branding
        },
      }}
    >
      {/* Existing WTEN Providers (e.g., SessionProvider) */}
      {children}
    </PrivyProvider>
  );
}
```

---

## 3. Secure Backend Link Route (`/api/account/privy`)

Create a secure route in WTEN to authenticate and link the Privy DID to the active WTEN session.

### Install Server SDK
```bash
bun add @privy-io/server-auth
```

### Server Configuration (`.env.local`)
```env
PRIVY_APP_SECRET=your-shared-privy-app-secret-here
```

### Route Implementation (`src/app/api/account/privy/route.ts`)

```typescript
import { NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/server-auth";
import { getAuthSession } from "@/lib/auth"; // Replace with your WTEN auth session helper
import { prisma } from "@/lib/db"; // Replace with your Prisma Client singleton

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const privyAppSecret = process.env.PRIVY_APP_SECRET;

let privyClient: PrivyClient | null = null;
if (privyAppId && privyAppSecret) {
  privyClient = new PrivyClient(privyAppId, privyAppSecret);
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!privyClient) {
    return NextResponse.json({ 
      success: false, 
      error: "Privy server is unconfigured",
      detail: "PRIVY_APP_SECRET or NEXT_PUBLIC_PRIVY_APP_ID is missing."
    }, { status: 500 });
  }

  let body: { privyToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const privyToken = body.privyToken?.trim();
  if (!privyToken) {
    return NextResponse.json({ success: false, error: "`privyToken` is required" }, { status: 400 });
  }

  try {
    // 1. Verify Privy ID token and extract user claims / DID
    const verifiedClaims = await privyClient.verifyIdToken(privyToken);
    const privyDid = verifiedClaims.userId;

    if (!privyDid) {
      return NextResponse.json({ success: false, error: "Invalid token claims" }, { status: 400 });
    }

    // 2. Conflict Check: Verify if DID is already linked to another user
    const existingLinkage = await prisma.user.findUnique({
      where: { privyDid }
    });

    if (existingLinkage && existingLinkage.id !== userId) {
      return NextResponse.json({ 
        success: false, 
        error: "This Privy identity is already linked to another WTEN account." 
      }, { status: 409 });
    }

    // 3. Perform linking atomic write
    await prisma.user.update({
      where: { id: userId },
      data: { privyDid }
    });

    return NextResponse.json({ success: true, privyDid });
  } catch (err) {
    return NextResponse.json({ 
      success: false, 
      error: "Failed to link identity",
      detail: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}
```

---

## 4. Cross-Site Profile Unification Queries

Once users have linked their Privy DIDs across both platforms, their records can be joined internally. For reporting, data aggregation, or synchronization, you can run cross-database joins or API federations:

### Direct SQL Join (If sharing a database cluster/schema)
```sql
SELECT 
  u_alchm.email AS alchm_email,
  u_wten.email AS wten_email,
  u_alchm.privy_did,
  y.spirit,
  y.essence
FROM alchm_kitchen.users u_alchm
INNER JOIN wten.users u_wten ON u_alchm.privy_did = u_wten.privy_did
LEFT JOIN alchm_kitchen.token_balances y ON u_alchm.id = y.user_id;
```

### API-Based Sync
Planetary hour sync scripts or other background services can resolve user profiles across sites:
```typescript
async function fetchSiblingProfile(privyDid: string) {
  const response = await fetch(`${process.env.API_BASE_URL}/api/internal/user-sync`, {
    headers: {
      "Authorization": `Bearer ${process.env.ALCHM_KITCHEN_SYNC_SECRET}`
    },
    body: JSON.stringify({ privyDid })
  });
  return response.json();
}
```
