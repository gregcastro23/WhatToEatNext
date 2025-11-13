"use client";

import React from "react";
import { createContext } from "react";
import type { TarotContextType } from "./types";

const defaultContext: TarotContextType = {
  tarotCard: null,
  tarotElementalInfluences: {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  },
  setTarotCard: () => {},
  setTarotElementalInfluences: () => {},
};

export const _TarotContext = createContext<TarotContextType>(defaultContext);
