/**
 * Output budgets for the V2 model calls. Four categories of 3-4 detailed prior-art items need
 * about 3.5k tokens or more; the V1 call asks for 3000 and the model's answer is cut off mid-JSON
 * (measured 20 Oct 2026 against the live API).
 */
export const PRIOR_ART_TOKENS = 6000;
/** 5-7 industries with inspirations; the V1 call uses the same budget. */
export const NEED_TOKENS = 6000;
