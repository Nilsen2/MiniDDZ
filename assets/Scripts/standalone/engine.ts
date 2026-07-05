import { createDeck, dealThreePlayers, shuffleCards, sortCards } from "./deck";
import { analyseCards, canBeat, containsCards, removeCards } from "./rules";
import { BidRecord, Card, CardCombo, GamePhase, GameSnapshot, PlayRecord, PlayerState, CardComboType, Rank } from "./types";

export interface StartGameOptions {
    playerIds: string[];
    playerNames?: string[];
    random?: () => number;
}

export interface PlayResult {
    success: boolean;
    combo?: CardCombo;
    error?: string;
    winnerId?: string;
}

export default class DouDizhuStandalone {
    private players: PlayerState[] = [];
    private bottomCards: Card[] = [];
    private phase: GamePhase = GamePhase.Idle;
    private currentPlayerIndex: number = 0;
    private landlordId: string | null = null;
    private lastPlay: PlayRecord | null = null;
    private passCount: number = 0;
    private winnerId: string | null = null;
    private bidHistory: BidRecord[] = [];
    private highestBid: BidRecord | null = null;

    start(options: StartGameOptions): GameSnapshot {
        if (options.playerIds.length !== 3) {
            throw new Error("Dou Dizhu needs exactly 3 players.");
        }

        const deck = shuffleCards(createDeck(), options.random);
        const dealt = dealThreePlayers(deck);

        this.players = options.playerIds.map((id, index) => ({
            id,
            name: options.playerNames && options.playerNames[index] ? options.playerNames[index] : id,
            hand: dealt[index],
            isLandlord: false,
        }));

        this.bottomCards = dealt[3];
        this.phase = GamePhase.Bidding;
        const firstPlayerIndex = Math.floor(
            (options.random ?? Math.random)() * 3
        );
        this.currentPlayerIndex = firstPlayerIndex;
        this.landlordId = null;
        this.lastPlay = null;
        this.passCount = 0;
        this.winnerId = null;
        this.bidHistory = [];
        this.highestBid = null;

        return this.snapshot();
    }

    bid(playerId: string, rob: boolean): GameSnapshot {
        this.assertPhase(GamePhase.Bidding);
        this.assertCurrentPlayer(playerId);

        const score = rob ? 3 : 0;
        if (score < 0 || score > 3) {
            throw new Error("Bid score must be between 0 and 3.");
        }

        if (this.highestBid && score > 0 && score <= this.highestBid.score) {
            throw new Error("Bid score must be higher than current highest bid.");
        }

        const record = { playerId, score };
        this.bidHistory.push(record);

        if (score > 0) {
            this.highestBid = record;
        }

        if (score === 3 || this.bidHistory.length >= 3) {
            this.confirmLandlord();
        } else {
            this.nextPlayer();
        }

        return this.snapshot();
    }

    play(playerId: string, cards: Card[]): PlayResult {
        this.assertPhase(GamePhase.Playing);
        this.assertCurrentPlayer(playerId);

        const player = this.getPlayer(playerId);
        if (!containsCards(player.hand, cards)) {
            return { success: false, error: "Selected cards are not in player's hand." };
        }

        const combo = analyseCards(cards);
        if (!combo) {
            return { success: false, error: "Invalid card combo." };
        }

        if (this.lastPlay && this.lastPlay.playerId !== playerId && !canBeat(combo, this.lastPlay.combo)) {
            return { success: false, error: "Selected combo cannot beat last play." };
        }

        player.hand = sortCards(removeCards(player.hand, cards));
        this.lastPlay = { playerId, combo };
        this.passCount = 0;

        if (player.hand.length === 0) {
            this.phase = GamePhase.GameOver;
            this.winnerId = playerId;
            return { success: true, combo, winnerId: playerId };
        }

        this.nextPlayer();
        return { success: true, combo };
    }

    pass(playerId: string): GameSnapshot {
        this.assertPhase(GamePhase.Playing);
        this.assertCurrentPlayer(playerId);

        if (!this.lastPlay || this.lastPlay.playerId === playerId) {
            throw new Error("Player cannot pass when leading a round.");
        }

        this.passCount++;

        if (this.passCount >= 2) {
            this.currentPlayerIndex = this.getPlayerIndex(this.lastPlay.playerId);
            this.lastPlay = null;
            this.passCount = 0;
        } else {
            this.nextPlayer();
        }

        return this.snapshot();
    }

    getPromptContext(): PlayRecord | null {
        return this.lastPlay;
    }

    snapshot(): GameSnapshot {
        return {
            phase: this.phase,
            players: this.players.map(player => ({
                id: player.id,
                name: player.name,
                hand: player.hand.slice(),
                isLandlord: player.isLandlord,
            })),
            landlordId: this.landlordId,
            bottomCards: this.bottomCards.slice(),
            currentPlayerId: this.players[this.currentPlayerIndex] ? this.players[this.currentPlayerIndex].id : null,
            lastPlay: this.lastPlay ? {
                playerId: this.lastPlay.playerId,
                combo: {
                    type: this.lastPlay.combo.type,
                    mainRank: this.lastPlay.combo.mainRank,
                    length: this.lastPlay.combo.length,
                    cards: this.lastPlay.combo.cards.slice(),
                    sequenceLength: this.lastPlay.combo.sequenceLength,
                },
            } : null,
            winnerId: this.winnerId,
            passCount: this.passCount,
            bidHistory: this.bidHistory.slice(),
        };
    }

    private confirmLandlord() {
        const landlordRecord = this.highestBid && this.highestBid.score > 0
            ? this.highestBid
            : { playerId: this.players[0].id, score: 1 };
        const landlord = this.getPlayer(landlordRecord.playerId);

        landlord.isLandlord = true;
        landlord.hand = sortCards(landlord.hand.concat(this.bottomCards));
        this.landlordId = landlord.id;
        this.currentPlayerIndex = this.getPlayerIndex(landlord.id);
        this.phase = GamePhase.Playing;
    }

    private getPlayer(playerId: string): PlayerState {
        const player = this.players[this.getPlayerIndex(playerId)];
        if (!player) {
            throw new Error(`Player not found: ${playerId}`);
        }

        return player;
    }

    private getPlayerIndex(playerId: string): number {
        const index = this.players.findIndex(player => player.id === playerId);
        if (index < 0) {
            throw new Error(`Player not found: ${playerId}`);
        }

        return index;
    }

    private nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    private assertPhase(phase: GamePhase) {
        if (this.phase !== phase) {
            throw new Error(`Invalid phase: expected ${phase}, got ${this.phase}.`);
        }
    }

    private assertCurrentPlayer(playerId: string) {
        const currentPlayer = this.players[this.currentPlayerIndex];
        if (!currentPlayer || currentPlayer.id !== playerId) {
            throw new Error(`It is not ${playerId}'s turn.`);
        }
    }
    /**
     * 获取当前玩家推荐出的牌
     */
    getHint(playerId: string): Card[] {

        const player = this.getPlayer(playerId);

        // 自己首出
        if (!this.lastPlay) {
            return [player.hand[player.hand.length - 1]];
        }

        // 自己重新获得牌权
        if (this.lastPlay.playerId === playerId) {
            return [player.hand[player.hand.length - 1]];
        }

        const target = this.lastPlay.combo;

        // 单牌
        if (target.type === CardComboType.Single) {

            for (let i = player.hand.length - 1; i >= 0; i--) {

                const card = player.hand[i];

                const combo = analyseCards([card]);

                if (combo && canBeat(combo, target)) {
                    return [card];
                }

            }

        }

        // 对子
        if (target.type === CardComboType.Pair) {

            for (let i = player.hand.length - 2; i >= 0; i--) {

                if (
                    player.hand[i].rank === player.hand[i + 1].rank
                ) {

                    const cards = [
                        player.hand[i],
                        player.hand[i + 1]
                    ];

                    const combo = analyseCards(cards);

                    if (combo && canBeat(combo, target)) {
                        return cards;
                    }

                }

            }

        }

        // 三张
        if (target.type === CardComboType.Triple) {

            for (let i = player.hand.length - 3; i >= 0; i--) {

                if (
                    player.hand[i].rank === player.hand[i + 1].rank &&
                    player.hand[i].rank === player.hand[i + 2].rank
                ) {

                    const cards = [
                        player.hand[i],
                        player.hand[i + 1],
                        player.hand[i + 2]
                    ];

                    const combo = analyseCards(cards);

                    if (combo && canBeat(combo, target)) {
                        return cards;
                    }

                }

            }

        }

        // 炸弹
        const bomb = this.findBomb(player.hand);

        if (bomb) {
            return bomb;
        }

        // 王炸
        const rocket = this.findRocket(player.hand);

        if (rocket) {
            return rocket;
        }

        return [];
    }
    private findBomb(hand: Card[]): Card[] | null {

        for (let i = 0; i < hand.length - 3; i++) {

            if (
                hand[i].rank === hand[i + 1].rank &&
                hand[i].rank === hand[i + 2].rank &&
                hand[i].rank === hand[i + 3].rank
            ) {

                return [
                    hand[i],
                    hand[i + 1],
                    hand[i + 2],
                    hand[i + 3]
                ];

            }

        }

        return null;

    }
    private findRocket(hand: Card[]): Card[] | null {

        const small = hand.find(c => c.rank === Rank.SmallJoker);

        const big = hand.find(c => c.rank === Rank.BigJoker);

        if (small && big) {

            return [small, big];

        }

        return null;

    }
    autoPlay(playerId: string | null): GameSnapshot {
        if (!playerId) {
            throw new Error("Player ID is required for autoPlay.");
        }

        const cards = this.getHint(playerId);

        if (cards.length > 0) {

            this.play(playerId, cards);

        } else {

            this.pass(playerId);

        }

        return this.snapshot();

    }
}
