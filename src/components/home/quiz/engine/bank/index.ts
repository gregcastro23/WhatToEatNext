import { APPETITE_QUESTIONS } from "./appetite";
import { PRACTICAL_QUESTIONS } from "./practical";
import { SENSES_QUESTIONS } from "./senses";
import { VERSUS_QUESTIONS } from "./versus";
import type { BankQuestion } from "../types";

/** Every hand-written question. The selector decides which to ask, and when. */
export const STATIC_BANK: readonly BankQuestion[] = [
  ...APPETITE_QUESTIONS,
  ...SENSES_QUESTIONS,
  ...PRACTICAL_QUESTIONS,
  ...VERSUS_QUESTIONS,
];
