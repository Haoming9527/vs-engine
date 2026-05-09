export type FighterStat = {
  name: string;
  power: number;
  speed: number;
  tactics: number;
  durability: number;
  chaos: number;
  range?: StandRating;
  defence?: StandRating;
  intelligent?: StandRating;
  developmentPotential?: StandRating;
  edge: string;
};

export type StandRating =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "Infinite"
  | "Complete"
  | "None"
  | "?";

export type BattleRound = {
  title: string;
  narration: string;
  edge: string;
  interference?: string;
};

export type BattleSimulation = {
  title: string;
  fighterADescription: string;
  fighterBDescription: string;
  stats: {
    fighterA: FighterStat;
    fighterB: FighterStat;
  };
  rounds: BattleRound[];
  winner: string;
  explanation: string;
  controversyScore: number;
};

export type InterventionResult = {
  round: BattleRound;
  winner: string;
  explanation: string;
  controversyScore: number;
  status: "ongoing" | "finished";
};

export type BattleFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export type CommentFormState = {
  error?: string;
  success?: boolean;
};

export type LoginFormState = {
  error?: string;
};

export type SignupFormState = {
  error?: string;
};

export type InterferenceFormState = {
  error?: string;
  success?: boolean;
};

export type SessionUser = {
  email: string;
  name: string;
};
