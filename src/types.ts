export const FIVE_ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water'] as const;
export type FiveElement = (typeof FIVE_ELEMENTS)[number];

export const POLARITIES = ['yang', 'yin'] as const;
export type Polarity = (typeof POLARITIES)[number];

export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export type HeavenlyStem = (typeof HEAVENLY_STEMS)[number];

export const EARTHLY_BRANCHES = [
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥',
] as const;
export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number];

export type Pillar = {
  heavenlyStem: HeavenlyStem;
  earthlyBranch: EarthlyBranch;
  label: string;
};

export type Pillars = {
  year: Pillar;
  month: Pillar;
  day: Pillar;
};

export type CalculateMeishikiInput = {
  /** ISO 8601 calendar date (YYYY-MM-DD). It is evaluated at 00:00 in JST. */
  birthDate: string;
};

export type FiveElementBalance = Record<FiveElement, number>;

export type MajorStarKey =
  | '貫索星'
  | '石門星'
  | '鳳閣星'
  | '調舒星'
  | '禄存星'
  | '司禄星'
  | '車騎星'
  | '牽牛星'
  | '龍高星'
  | '玉堂星';

export type TwelveLifeStageKey =
  | '天報星'
  | '天印星'
  | '天貴星'
  | '天恍星'
  | '天南星'
  | '天禄星'
  | '天将星'
  | '天堂星'
  | '天胡星'
  | '天極星'
  | '天庫星'
  | '天馳星';

export type MajorStars = {
  head: MajorStarKey;
  rightHand: MajorStarKey;
  chest: MajorStarKey;
  leftHand: MajorStarKey;
  belly: MajorStarKey;
};

export type TwelveLifeStages = {
  year: TwelveLifeStageKey;
  month: TwelveLifeStageKey;
  day: TwelveLifeStageKey;
};

export type HumanStarChart = {
  head: MajorStarKey;
  leftShoulder: TwelveLifeStageKey;
  rightHand: MajorStarKey;
  chest: MajorStarKey;
  leftHand: MajorStarKey;
  rightFoot: TwelveLifeStageKey;
  belly: MajorStarKey;
  leftFoot: TwelveLifeStageKey;
};

export type MeishikiResult = {
  birthDate: string;
  pillars: Pillars;
  dayMaster: {
    heavenlyStem: HeavenlyStem;
    earthlyBranch: EarthlyBranch;
    fiveElement: FiveElement;
    polarity: Polarity;
  };
  fiveElementBalance: FiveElementBalance;
  majorStars: MajorStars;
  twelveLifeStages: TwelveLifeStages;
  humanStarChart: HumanStarChart;
  analysis: SanmeigakuAnalysis;
};

export type StarInsight<Key extends string> = {
  key: Key;
  title: string;
  description: string;
  keywords: readonly string[];
};

export type MajorStarInsight = StarInsight<MajorStarKey> & {
  sourceStem: HeavenlyStem;
};

export type TwelveLifeStageInsight = StarInsight<TwelveLifeStageKey>;

export type FiveElementBalanceInsight = {
  counts: FiveElementBalance;
  sorted: readonly {
    element: FiveElement;
    label: string;
    symbol: string;
    count: number;
    color: string;
  }[];
  strongest: readonly FiveElement[];
  weakest: readonly FiveElement[];
  description: string;
};

export type HumanStarChartCell =
  | (MajorStarInsight & { kind: '十大主星' })
  | (TwelveLifeStageInsight & { kind: '十二大従星' });

export type SanmeigakuAnalysis = {
  fiveElementBalance: FiveElementBalanceInsight;
  majorStars: Record<keyof MajorStars, MajorStarInsight>;
  twelveLifeStages: Record<keyof TwelveLifeStages, TwelveLifeStageInsight>;
  humanStarChart: Record<keyof HumanStarChart, HumanStarChartCell>;
};

export class SanmeigakuInputError extends Error {
  readonly code = 'INVALID_BIRTH_DATE';
  constructor(message: string) {
    super(message);
    this.name = 'SanmeigakuInputError';
  }
}

export class SanmeigakuRangeError extends RangeError {
  readonly code = 'UNSUPPORTED_BIRTH_DATE';
  constructor(message: string) {
    super(message);
    this.name = 'SanmeigakuRangeError';
  }
}
