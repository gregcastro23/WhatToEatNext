import { quinoa } from "./quinoa";
import { amaranth } from "./amaranth";
import { buckwheat } from "./buckwheat";
import { chia } from "./chia";
import { flaxseed } from "./flaxseed";

// Export all pseudo grains as a consolidated object
export const pseudoGrains = {
    ...quinoa,
    ...amaranth,
    ...buckwheat,
    ...chia,
    ...flaxseed
};

export { quinoa, amaranth, buckwheat, chia, flaxseed };
