export enum Suit {
    Spade = "spade",
    Heart = "heart",
    Club = "club",
    Diamond = "diamond",
    Joker = "joker",
}

export enum Rank {
    Three = 3,
    Four = 4,
    Five = 5,
    Six = 6,
    Seven = 7,
    Eight = 8,
    Nine = 9,
    Ten = 10,
    Jack = 11,
    Queen = 12,
    King = 13,
    Ace = 14,
    Two = 15,
    SmallJoker = 16,
    BigJoker = 17,
}

export enum CardComboType {
    Single = "single",
    Pair = "pair",
    Triple = "triple",
    TripleWithSingle = "tripleWithSingle",
    TripleWithPair = "tripleWithPair",
    Straight = "straight",
    PairStraight = "pairStraight",
    Plane = "plane",
    PlaneWithSingles = "planeWithSingles",
    PlaneWithPairs = "planeWithPairs",
    FourWithTwoSingles = "fourWithTwoSingles",
    FourWithTwoPairs = "fourWithTwoPairs",
    Bomb = "bomb",
    Rocket = "rocket",
}

export enum GamePhase {
    Idle = "idle",
    Bidding = "bidding",
    Playing = "playing",
    GameOver = "gameOver",
}

export interface Card {
    id: string;
    rank: Rank;
    suit: Suit;
}

export interface PlayerState {
    id: string;
    name: string;
    hand: Card[];
    isLandlord: boolean;
}

export interface CardCombo {
    type: CardComboType;
    mainRank: Rank;
    length: number;
    cards: Card[];
    sequenceLength?: number;
}

export interface PlayRecord {
    playerId: string;
    combo: CardCombo;
}

export interface BidRecord {
    playerId: string;
    score: number;
}

export interface GameSnapshot {
    phase: GamePhase;
    players: PlayerState[];
    landlordId: string | null;
    bottomCards: Card[];
    currentPlayerId: string | null;
    lastPlay: PlayRecord | null;
    winnerId: string | null;
    passCount: number;
    bidHistory: BidRecord[];
}
