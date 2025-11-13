"use client";

import React from "react";
import { createContext } from "react";
import type { PopupContextType } from "./types";

export const _PopupContext = createContext<PopupContextType | null>(null);
