/**
 * Styles for the lazy half of the omnibar (dropdown, sheet, rows). Loaded
 * with the chunk, so none of it counts toward a page's First Load.
 */
export const OMNIBAR_RESULTS_CSS = `
.omni-dropdown {
  position: absolute; top: calc(100% + 8px); right: 0; z-index: 60;
  width: min(580px, calc(100vw - 32px));
  max-height: min(640px, calc(100vh - 96px));
  display: flex; flex-direction: column; overflow: hidden;
  background: linear-gradient(180deg, rgba(20,16,30,0.98), rgba(14,12,22,0.98));
  border: 1px solid var(--line-hi, rgba(255,255,255,0.14)); border-radius: 12px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.55);
  color: var(--fg); text-align: left;
}
.omni-results { display: flex; flex-direction: column; min-height: 0; flex: 1; }
.omni-listbox { flex: 1; overflow-y: auto; padding: 4px 8px 8px; overscroll-behavior: contain; }
.omni-correction, .omni-status {
  padding: 10px 16px 4px; font-size: 12px; color: var(--fg-dim);
}
.omni-correction strong { color: var(--fg); font-weight: 600; }
.omni-mute { color: var(--fg-mute); }
.omni-sec-title {
  padding: 12px 8px 6px; font-family: var(--f-mono); font-size: 9px;
  letter-spacing: 0.16em; color: var(--fg-mute);
}
.omni-opt {
  display: grid; grid-template-columns: 28px 1fr; gap: 12px; align-items: center;
  min-height: 44px; padding: 7px 10px; border-radius: 8px;
  color: inherit; text-decoration: none; cursor: pointer;
}
.omni-opt[aria-selected="true"] { background: color-mix(in oklch, var(--accent), transparent 86%); }
.omni-opt-hero { display: block; padding: 10px; }
.omni-opt-icon {
  width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.04); border: 1px solid var(--line); color: var(--fg-mute);
}
.omni-opt[aria-selected="true"] .omni-opt-icon { color: var(--accent); }
.omni-opt-text { display: flex; flex-direction: column; min-width: 0; }
.omni-opt-label { font-size: 13px; color: var(--fg-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.omni-opt[aria-selected="true"] .omni-opt-label { color: var(--fg); }
.omni-opt-hint {
  margin-top: 2px; font-family: var(--f-mono); font-size: 9px; letter-spacing: 0.12em; color: var(--fg-mute);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
[data-section="all"] .omni-opt-label { color: var(--accent); }
.omni-hero { display: grid; grid-template-columns: 52px 1fr auto auto; gap: 14px; align-items: center; }
.omni-hero-thumb {
  width: 52px; height: 52px; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.05); border: 1px solid var(--line);
  font-family: var(--f-display); font-size: 18px; color: var(--fg-dim); text-transform: uppercase;
}
.omni-hero-thumb img { width: 100%; height: 100%; object-fit: cover; }
.omni-hero-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.omni-hero-name { font-family: var(--f-display); font-size: 20px; line-height: 1.1; color: var(--fg); }
.omni-hero-meta, .omni-hero-facts {
  font-family: var(--f-mono); font-size: 9px; letter-spacing: 0.12em; color: var(--fg-mute);
  display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
}
.omni-hero-facts { font-family: var(--f-body); font-size: 11px; letter-spacing: 0; color: var(--fg-dim); }
.omni-badge {
  padding: 1px 6px; border-radius: 999px; font-size: 8px;
  color: var(--el-earth, oklch(0.74 0.11 130));
  border: 1px solid color-mix(in oklch, var(--el-earth, oklch(0.74 0.11 130)), transparent 55%);
}
.omni-meter { display: flex; gap: 3px; align-items: flex-end; height: 34px; }
.omni-meter-bar { width: 6px; height: 100%; display: flex; align-items: flex-end; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; }
.omni-meter-bar > span { width: 100%; border-radius: 2px; }
.omni-hero-count { display: flex; flex-direction: column; align-items: flex-end; }
.omni-hero-count-n { font-family: var(--f-display); font-size: 22px; line-height: 1; color: var(--fg); }
.omni-hero-count-l { font-family: var(--f-mono); font-size: 8px; letter-spacing: 0.14em; color: var(--fg-mute); }
.omni-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 10px 8px 76px; }
.omni-chip {
  display: inline-flex; align-items: center; gap: 6px; min-height: 32px; padding: 5px 12px;
  border-radius: 999px; border: 1px solid var(--line); background: rgba(255,255,255,0.03);
  color: var(--fg-dim); font-size: 12px; font-family: var(--f-body); cursor: pointer; text-decoration: none;
}
.omni-chip[aria-selected="true"] {
  color: var(--fg); background: color-mix(in oklch, var(--accent), transparent 80%);
  border-color: color-mix(in oklch, var(--accent), transparent 45%);
}
.omni-chip[data-pressed="true"] { color: var(--el-earth, oklch(0.74 0.11 130)); }
.omni-notice { color: var(--el-earth, oklch(0.74 0.11 130)); }
.omni-footer {
  display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;
  padding: 9px 16px; border-top: 1px solid var(--line); background: rgba(255,255,255,0.015);
  font-family: var(--f-mono); font-size: 9px; letter-spacing: 0.14em; color: var(--fg-mute);
}
.omni-footer kbd {
  font-family: var(--f-mono); font-size: 9px; padding: 1px 5px; margin: 0 4px 0 8px;
  border: 1px solid var(--line); border-radius: 3px; color: var(--fg-dim);
}
.omni-footer kbd:first-child { margin-left: 0; }
.omni-sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
.omni-sheet {
  position: fixed; inset: 0; z-index: 1000; display: flex; flex-direction: column;
  background: linear-gradient(180deg, rgb(20,16,30), rgb(10,8,16));
  color: var(--fg); padding-top: env(safe-area-inset-top, 0px);
}
.omni-sheet-bar {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px;
  border-bottom: 1px solid var(--line);
}
.omni-sheet-field {
  flex: 1; display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 0 12px;
  background: rgba(255,255,255,0.04); border: 1px solid var(--line); border-radius: 10px; color: var(--fg-mute);
}
.omni-sheet-field input {
  flex: 1; min-width: 0; background: transparent; border: none; outline: none;
  color: var(--fg); font-size: 16px; font-family: var(--f-body);
}
.omni-sheet-cancel {
  min-height: 44px; padding: 0 6px; background: none; border: none;
  color: var(--accent); font-size: 14px; cursor: pointer;
}
.omni-sheet .omni-footer { display: none; }
.omni-sheet .omni-chip { min-height: 44px; }
.omni-sheet .omni-listbox { padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px)); }
@media (max-width: 520px) {
  .omni-chips { padding-left: 10px; }
  .omni-hero { grid-template-columns: 44px 1fr auto; }
  .omni-hero-thumb { width: 44px; height: 44px; }
  .omni-meter { display: none; }
}
`;
