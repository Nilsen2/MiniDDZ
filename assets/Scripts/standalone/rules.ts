import { Card, CardCombo, CardComboType, Rank } from "./types";
import { sortCards } from "./deck";

type RankCount = {
    rank: Rank;
    count: number;
};

function countRanks(cards: Card[]): RankCount[] {
    const map: { [rank: number]: number } = {};

    cards.forEach(card => {
        map[card.rank] = (map[card.rank] || 0) + 1;
    });

    return Object.keys(map)
        .map(rank => ({ rank: Number(rank) as Rank, count: map[Number(rank)] }))
        .sort((a, b) => b.rank - a.rank);
}

function ranksByCount(counts: RankCount[], count: number): Rank[] {
    return counts
        .filter(item => item.count === count)
        .map(item => item.rank)
        .sort((a, b) => b - a);
}

function isConsecutive(ranks: Rank[]): boolean {
    if (ranks.length < 2) {
        return true;
    }

    const sorted = ranks.slice().sort((a, b) => a - b);
    if (sorted.some(rank => rank >= Rank.Two)) {
        return false;
    }

    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] !== sorted[i - 1] + 1) {
            return false;
        }
    }

    return true;
}

function combo(type: CardComboType, mainRank: Rank, cards: Card[], sequenceLength?: number): CardCombo {
    return {
        type,
        mainRank,
        length: cards.length,
        cards: sortCards(cards),
        sequenceLength,
    };
}

export function analyseCards(cards: Card[]): CardCombo | null {
    const sortedCards = sortCards(cards);
    const counts = countRanks(sortedCards);
    const length = sortedCards.length;

    if (length === 0) {
        return null;
    }

    if (
        length === 2 &&
        counts.length === 2 &&
        counts.some(item => item.rank === Rank.SmallJoker) &&
        counts.some(item => item.rank === Rank.BigJoker)
    ) {
        return combo(CardComboType.Rocket, Rank.BigJoker, sortedCards);
    }

    if (counts.length === 1) {
        const rank = counts[0].rank;

        if (length === 1) {
            return combo(CardComboType.Single, rank, sortedCards);
        }
        if (length === 2) {
            return combo(CardComboType.Pair, rank, sortedCards);
        }
        if (length === 3) {
            return combo(CardComboType.Triple, rank, sortedCards);
        }
        if (length === 4) {
            return combo(CardComboType.Bomb, rank, sortedCards);
        }
    }

    const triples = ranksByCount(counts, 3);
    const pairs = ranksByCount(counts, 2);
    const quads = ranksByCount(counts, 4);

    if (length === 4 && triples.length === 1) {
        return combo(CardComboType.TripleWithSingle, triples[0], sortedCards);
    }

    if (length === 5 && triples.length === 1 && pairs.length === 1) {
        return combo(CardComboType.TripleWithPair, triples[0], sortedCards);
    }

    if (length >= 5 && counts.length === length && isConsecutive(counts.map(item => item.rank))) {
        return combo(CardComboType.Straight, counts[0].rank, sortedCards, length);
    }

    if (
        length >= 6 &&
        length % 2 === 0 &&
        counts.length === length / 2 &&
        counts.every(item => item.count === 2) &&
        isConsecutive(counts.map(item => item.rank))
    ) {
        return combo(CardComboType.PairStraight, counts[0].rank, sortedCards, counts.length);
    }

    if (
        length >= 6 &&
        length % 3 === 0 &&
        counts.length === length / 3 &&
        counts.every(item => item.count === 3) &&
        isConsecutive(counts.map(item => item.rank))
    ) {
        return combo(CardComboType.Plane, counts[0].rank, sortedCards, counts.length);
    }

    if (length >= 8 && length % 4 === 0) {
        const planeCount = length / 4;
        if (triples.length === planeCount && isConsecutive(triples)) {
            return combo(CardComboType.PlaneWithSingles, triples[0], sortedCards, planeCount);
        }
    }

    if (length >= 10 && length % 5 === 0) {
        const planeCount = length / 5;
        if (
            triples.length === planeCount &&
            pairs.length === planeCount &&
            counts.every(item => item.count === 2 || item.count === 3) &&
            isConsecutive(triples)
        ) {
            return combo(CardComboType.PlaneWithPairs, triples[0], sortedCards, planeCount);
        }
    }

    if (length === 6 && quads.length === 1) {
        return combo(CardComboType.FourWithTwoSingles, quads[0], sortedCards);
    }

    if (
        length === 8 &&
        quads.length === 1 &&
        counts.length === 3 &&
        counts.every(item => item.count === 4 || item.count === 2)
    ) {
        return combo(CardComboType.FourWithTwoPairs, quads[0], sortedCards);
    }

    return null;
}

export function canBeat(current: CardCombo, target: CardCombo): boolean {
    if (target.type === CardComboType.Rocket) {
        return false;
    }

    if (current.type === CardComboType.Rocket) {
        return true;
    }

    if (current.type === CardComboType.Bomb && target.type !== CardComboType.Bomb) {
        return true;
    }

    if (current.type !== target.type) {
        return false;
    }

    if (current.length !== target.length) {
        return false;
    }

    return current.mainRank > target.mainRank;
}

export function containsCards(hand: Card[], selected: Card[]): boolean {
    const handIds = hand.map(card => card.id);

    return selected.every(card => {
        const index = handIds.indexOf(card.id);
        if (index < 0) {
            return false;
        }

        handIds.splice(index, 1);
        return true;
    });
}

export function removeCards(hand: Card[], selected: Card[]): Card[] {
    const selectedIds = selected.map(card => card.id);

    return hand.filter(card => {
        const index = selectedIds.indexOf(card.id);
        if (index < 0) {
            return true;
        }

        selectedIds.splice(index, 1);
        return false;
    });
}
