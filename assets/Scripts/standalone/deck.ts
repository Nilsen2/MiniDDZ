import { Card, Rank, Suit } from "./types";

const NORMAL_RANKS: Rank[] = [
    Rank.Three,
    Rank.Four,
    Rank.Five,
    Rank.Six,
    Rank.Seven,
    Rank.Eight,
    Rank.Nine,
    Rank.Ten,
    Rank.Jack,
    Rank.Queen,
    Rank.King,
    Rank.Ace,
    Rank.Two,
];

const NORMAL_SUITS: Suit[] = [
    Suit.Spade,
    Suit.Heart,
    Suit.Club,
    Suit.Diamond,
];

export function createDeck(): Card[] {
    const cards: Card[] = [];

    NORMAL_RANKS.forEach(rank => {
        NORMAL_SUITS.forEach(suit => {
            cards.push({
                id: `${suit}-${rank}`,
                rank,
                suit,
            });
        });
    });

    cards.push({ id: "joker-small", rank: Rank.SmallJoker, suit: Suit.Joker });
    cards.push({ id: "joker-big", rank: Rank.BigJoker, suit: Suit.Joker });

    return cards;
}

export function shuffleCards(cards: Card[], random: () => number = Math.random): Card[] {
    const result = cards.slice();

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        const temp = result[i];
        result[i] = result[j];
        result[j] = temp;
    }

    return result;
}

export function sortCards(cards: Card[]): Card[] {
    return cards.slice().sort((a, b) => {
        if (b.rank !== a.rank) {
            return b.rank - a.rank;
        }

        return b.suit.localeCompare(a.suit);
    });
}

export function dealThreePlayers(deck: Card[]): [Card[], Card[], Card[], Card[]] {
    if (deck.length !== 54) {
        throw new Error("Dou Dizhu deck must contain 54 cards.");
    }

    return [
        sortCards(deck.slice(0, 17)),
        sortCards(deck.slice(17, 34)),
        sortCards(deck.slice(34, 51)),
        sortCards(deck.slice(51, 54)),
    ];
}
