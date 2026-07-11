"use client";

import { Users } from "lucide-react";
import { useState, type JSX, type ReactNode } from "react";
import {
  AvatarClusterRing,
  AvatarRow,
  ChatBubble,
  ChatComposer,
  CompositeRadialBadge,
  ElementBars,
  ElementChip,
  GlassPanel,
  GradientButton,
  GradientText,
  LabelXS,
  PresenceAvatar,
  ReactionBar,
  RsvpChip,
  type AvatarPerson,
  type ReactionKind,
} from "@/components/tables/ui";

/**
 * Sample fixtures use the REAL historical-agent roster (spec §4.8) —
 * names/titles/elements mirror src/lib/demo-agents-data.ts, the same
 * chart-bearing sages the cosmic roster serves. No photos exist for them,
 * so every avatar exercises the element-sigil fallback (never invented faces).
 */
const ROSTER: Array<AvatarPerson & { title: string }> = [
  { name: "Leonardo da Vinci", element: "Air", title: "Renaissance Polymath & Visionary" },
  { name: "William Shakespeare", element: "Water", title: "The Bard of Avon" },
  { name: "Nikola Tesla", element: "Fire", title: "Electrical Visionary" },
  { name: "Marie Curie", element: "Earth", title: "Pioneer of Radioactivity" },
  { name: "Cleopatra VII", element: "Fire", title: "Queen of the Nile" },
  { name: "Albert Einstein", element: "Air", title: "Father of Modern Physics" },
  { name: "Carl Jung", element: "Water", title: "Founder of Analytical Psychology" },
  { name: "Isaac Newton", element: "Earth", title: "Master of Gravitational Law" },
];

const [leonardo, shakespeare, tesla, curie, cleopatra, einstein, jung, newton] =
  ROSTER;

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <section className="space-y-4">
      <LabelXS as="h2" className="text-alchm-fg-mute tracking-[0.2em]">
        {title}
      </LabelXS>
      {children}
    </section>
  );
}

export default function TablesKitPreview(): JSX.Element {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  const [reactionCounts, setReactionCounts] = useState<
    Partial<Record<ReactionKind, number>>
  >({ spark: 12, Fire: 4, Water: 9, Earth: 2, Air: 5 });
  const [myReactions, setMyReactions] = useState<ReactionKind[]>(["Water"]);

  const handleReact = (kind: ReactionKind) => {
    const isActive = myReactions.includes(kind);
    setMyReactions((prev) =>
      isActive ? prev.filter((k) => k !== kind) : [...prev, kind],
    );
    setReactionCounts((prev) => ({
      ...prev,
      [kind]: Math.max(0, (prev[kind] ?? 0) + (isActive ? -1 : 1)),
    }));
  };

  return (
    <main className="min-h-screen bg-alchm-bg text-alchm-fg px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="space-y-2">
          <LabelXS className="text-alchm-violet-bright">
            DEV PREVIEW · TABLES KIT
          </LabelXS>
          <GradientText as="h1" className="text-display-lg">
            Tables UI Kit
          </GradientText>
          <p className="text-body-lg text-alchm-fg-warm">
            Every shared component from tables-design-spec.md §2, in every
            variant, against the void.
          </p>
        </header>

        <Section title="Type scale + tokens">
          <GlassPanel className="p-6 space-y-3">
            <p className="text-display-lg">display-lg 48/56</p>
            <p className="text-headline-md">headline-md 24/32</p>
            <p className="text-body-lg text-alchm-fg-warm">
              body-lg 18/28 in alchm-fg-warm metadata tone
            </p>
            <LabelXS className="block text-alchm-fg-dim">
              label-xs 10/16 +0.1em — the signature
            </LabelXS>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <span className="h-8 w-8 rounded-full bg-alchm-copper-bright" title="alchm-copper-bright" />
              <span className="h-8 w-8 rounded-full bg-alchm-violet-bright" title="alchm-violet-bright" />
              <span className="h-8 w-8 rounded-full bg-alchm-fg-warm" title="alchm-fg-warm" />
              <span className="h-8 w-8 rounded-full bg-gradient-alchm" title="bg-gradient-alchm" />
              <span className="h-8 w-8 rounded-full bg-alchm-bg-elev glow-violet" title="glow-violet" />
              <span className="h-8 w-8 rounded-full bg-alchm-bg-elev glow-amber" title="glow-amber" />
              <span className="h-8 w-8 rounded-full bg-alchm-violet animate-pulse-glow" title="animate-pulse-glow" />
            </div>
          </GlassPanel>
        </Section>

        <Section title="GlassPanel">
          <div className="grid gap-4 md:grid-cols-3">
            <GlassPanel className="p-5">
              <p className="text-sm text-alchm-fg-dim">default · rounded-2xl</p>
            </GlassPanel>
            <GlassPanel interactive className="p-5">
              <p className="text-sm text-alchm-fg-dim">interactive (hover me)</p>
            </GlassPanel>
            <GlassPanel rounded="32" className="p-5">
              <p className="text-sm text-alchm-fg-dim">rounded-[32px] artifact</p>
            </GlassPanel>
          </div>
        </Section>

        <Section title="GradientText + GradientButton">
          <GlassPanel className="p-6 flex flex-wrap items-center gap-6">
            <GradientText className="text-headline-md">
              Solstice Feast
            </GradientText>
            <GradientButton>Set the Table</GradientButton>
            <GradientButton disabled>Set the Table</GradientButton>
            <GradientButton aria-label="Invite guests">
              <Users size={16} aria-hidden /> Break Bread
            </GradientButton>
          </GlassPanel>
        </Section>

        <Section title="AvatarClusterRing — host / live / upcoming">
          <GlassPanel className="p-6 flex flex-wrap items-end gap-6">
            <AvatarClusterRing variant="host" label="HOST" />
            <AvatarClusterRing
              variant="live"
              label="LIVE"
              avatars={[leonardo, shakespeare, tesla]}
              element="Water"
            />
            <AvatarClusterRing
              variant="upcoming"
              label="8:00"
              avatars={[curie, cleopatra]}
              element="Fire"
            />
            <AvatarClusterRing
              variant="upcoming"
              label="TOM"
              avatars={[einstein]}
              element="Air"
            />
          </GlassPanel>
        </Section>

        <Section title="AvatarRow — overflow +N">
          <GlassPanel className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <LabelXS className="text-alchm-fg-dim">GUESTS</LabelXS>
              <AvatarRow people={ROSTER.slice(0, 3)} />
            </div>
            <div className="flex items-center gap-3">
              <LabelXS className="text-alchm-fg-dim">GUESTS</LabelXS>
              <AvatarRow people={ROSTER} />
            </div>
          </GlassPanel>
        </Section>

        <Section title="PresenceAvatar — plain / online / live">
          <GlassPanel className="p-6 flex flex-wrap items-center gap-6">
            <PresenceAvatar {...newton} />
            <PresenceAvatar {...jung} online />
            <PresenceAvatar {...shakespeare} live online size={56} />
            <PresenceAvatar {...tesla} online size={40} />
          </GlassPanel>
        </Section>

        <Section title="CompositeRadialBadge — composite / compatibility">
          <GlassPanel className="p-6 flex flex-wrap items-center gap-8">
            <CompositeRadialBadge
              values={{ Fire: 0.1, Water: 0.5, Earth: 0.25, Air: 0.15 }}
            />
            <CompositeRadialBadge
              values={{ Fire: 0.6, Water: 0.1, Earth: 0.1, Air: 0.2 }}
              size={64}
            />
            <CompositeRadialBadge variant="compatibility" value={0.87} />
            <CompositeRadialBadge variant="compatibility" value={0.42} size={64} />
          </GlassPanel>
        </Section>

        <Section title="ElementChip">
          <GlassPanel className="p-6 flex flex-wrap items-center gap-3">
            <ElementChip element="Water">WATER DOMINANT</ElementChip>
            <ElementChip element="Fire">FIRE · ARIES SUN</ElementChip>
            <ElementChip element="Earth" />
            <ElementChip element="Air" />
          </GlassPanel>
        </Section>

        <Section title="ElementBars">
          <GlassPanel className="p-6 max-w-sm">
            <LabelXS className="block mb-4 text-alchm-fg-mute tracking-[0.2em]">
              COSMIC IDENTITY
            </LabelXS>
            <ElementBars
              values={{ Fire: 0.35, Water: 0.4, Earth: 0.15, Air: 0.1 }}
            />
          </GlassPanel>
        </Section>

        <Section title="ReactionBar — inline / chip (interactive)">
          <GlassPanel className="p-6 space-y-6">
            <ReactionBar
              counts={reactionCounts}
              active={myReactions}
              onReact={handleReact}
            />
            <ReactionBar
              variant="chip"
              counts={reactionCounts}
              active={myReactions}
              onReact={handleReact}
            />
          </GlassPanel>
        </Section>

        <Section title="ChatBubble — other / self + reactions">
          <GlassPanel className="p-6 space-y-5">
            <ChatBubble
              variant="other"
              author={jung}
              timestamp="2M AGO"
              reactions={[{ kind: "Water" }, { kind: "spark" }]}
            >
              A shared table works like a mandala — each guest completes the
              pattern.
            </ChatBubble>
            <ChatBubble
              variant="other"
              author={leonardo}
            >
              Simplicity is the ultimate sophistication, in the kitchen above
              all.
            </ChatBubble>
            <ChatBubble
              variant="self"
              timestamp="NOW"
              reactions={[{ kind: "Fire" }]}
            >
              Saving you both seats — the broth has six hours to go.
            </ChatBubble>
          </GlassPanel>
        </Section>

        <Section title="ChatComposer — active / disabled">
          <GlassPanel className="p-6 space-y-4">
            <ChatComposer
              value={message}
              onChange={setMessage}
              onSend={() => {
                setSent((prev) => [...prev, message]);
                setMessage("");
              }}
              onPhoto={() => undefined}
            />
            <ChatComposer
              value=""
              onChange={() => undefined}
              onSend={() => undefined}
              disabled
              placeholder="Table is closed"
            />
            {sent.length > 0 && (
              <LabelXS className="block text-alchm-fg-mute">
                SENT: {sent.join(" · ")}
              </LabelXS>
            )}
          </GlassPanel>
        </Section>

        <Section title="RsvpChip">
          <GlassPanel className="p-6 space-y-3 max-w-sm">
            {(
              [
                [shakespeare, "joined"],
                [curie, "invited"],
                [newton, "declined"],
              ] as const
            ).map(([person, status]) => (
              <div
                key={person.name}
                className="flex items-center justify-between gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <PresenceAvatar {...person} size={32} />
                  <div>
                    <p className="text-sm text-alchm-fg">{person.name}</p>
                    <LabelXS className="text-alchm-fg-mute">
                      {ROSTER.find((r) => r.name === person.name)?.title}
                    </LabelXS>
                  </div>
                </div>
                <RsvpChip status={status} />
              </div>
            ))}
          </GlassPanel>
        </Section>
      </div>
    </main>
  );
}
