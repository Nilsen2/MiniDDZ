const { ccclass, property } = cc._decorator;
import CardView, { CardViewEvent } from "./Card";
import { Card } from "../standalone/types";
import { MINIDDZ_EVENT } from "../Event";
import { GAME_EVENT_ENUM, AUDIO_EFFECT_ENUM, DDZ_EFFECT_ENUM } from "../enum/Enum";


export interface PlayerData {
    id: string;
    name: string;
    gold: number;
    isSelf: boolean;
}

@ccclass
export default class PlayerView extends cc.Component {

    @property(cc.Sprite)
    avatar: cc.Sprite = null!;

    @property(cc.Label)
    lblName: cc.Label = null!;

    @property(cc.Label)
    lblGold: cc.Label = null!;

    @property(cc.Node)
    readyNode: cc.Node = null!;

    @property(cc.Node)
    landlordNode: cc.Node = null!;

    @property(cc.Node)
    clockNode: cc.Node = null!;

    @property(cc.Label)
    timeLabel: cc.Label = null!;

    @property(cc.Node)
    cardRoot: cc.Node = null!;

    @property(cc.Node)
    outCardRoot: cc.Node = null!;

    @property(cc.Prefab)
    cardPrefab: cc.Prefab = null!;

    private playerData: PlayerData = null!;

    private countdown = 0;
    private selectedCards: Card[] = [];

    onLoad() {
        this.resetView();
        this.cardRoot.on(CardViewEvent.Selected, this.onCardSelected, this);
        this.cardRoot.on(CardViewEvent.Unselected, this.onCardUnselected, this);
    }

    onDestroy() {
        this.cardRoot.off(CardViewEvent.Selected, this.onCardSelected, this);
        this.cardRoot.off(CardViewEvent.Unselected, this.onCardUnselected, this);
    }

    private onCardSelected(card: Card) {
        this.selectedCards.push(card);
    }
    private onCardUnselected(card: Card) {
        this.selectedCards = this.selectedCards.filter(c => c.id !== card.id);
    }
    clearSelectedCards() {
        this.selectedCards = [];
    }
    onClickPass() {
         MINIDDZ_EVENT.emit(DDZ_EFFECT_ENUM.PLAYER_PASS, {
            playerId: this.getPlayerData().id,
        });
        MINIDDZ_EVENT.emit(GAME_EVENT_ENUM.PLAY_AUDIO, AUDIO_EFFECT_ENUM.BUYAO);
    }
    onClickPlay() {
        if (this.selectedCards.length === 0) {
            console.warn("No cards selected to play.");
            return;
        }
        MINIDDZ_EVENT.emit(
            DDZ_EFFECT_ENUM.PLAYER_PLAY,
            {
                playerId: this.playerData.id,
                cards: this.selectedCards,
            }
        );
    }
    onClickBid(_event: cc.Event, isRob: string) {
        MINIDDZ_EVENT.emit(DDZ_EFFECT_ENUM.PLAYER_BID, {
            playerId: this.getPlayerData().id,
            rob: isRob === "true",
        });
        // 播放音效
        if (isRob === "true") {
            MINIDDZ_EVENT.emit(GAME_EVENT_ENUM.PLAY_AUDIO, AUDIO_EFFECT_ENUM.JIAODIZHU);
        } else {
            MINIDDZ_EVENT.emit(GAME_EVENT_ENUM.PLAY_AUDIO, AUDIO_EFFECT_ENUM.BUJIAO);
        }
    }

    init(data: PlayerData) {
        this.playerData = data;

        this.setName(data.name);
        this.setGold(data.gold);

        this.showReady(!data.isSelf);
        this.setLandlord(false);
        this.hideClock();
    }

    //----------------------------------------
    // 玩家信息
    //----------------------------------------

    setName(name: string) {
        this.lblName.string = name;
    }

    setGold(gold: number) {
        this.lblGold.string = gold.toString();

        if (this.playerData) {
            this.playerData.gold = gold;
        }
    }

    getPlayerData() {
        return this.playerData;
    }

    getSelectedCards() {
        return this.selectedCards;
    }

    //----------------------------------------
    // Ready
    //----------------------------------------

    showReady(show: boolean) {
        this.readyNode.active = show;
    }

    //----------------------------------------
    // 地主
    //----------------------------------------

    setLandlord(active: boolean) {
        this.landlordNode.active = active;
    }

    showBidPhase(active: boolean) {
        if (active) {
            this.showClock(15);
            if (!this.getPlayerData().isSelf) {
                // AI 随机抢或不抢
                const rob = Math.random() > 0.5;
                this.scheduleOnce(() => {
                    MINIDDZ_EVENT.emit(DDZ_EFFECT_ENUM.PLAYER_BID, {
                        playerId: this.getPlayerData().id,
                        rob,
                    });
                     if (rob) {
                        MINIDDZ_EVENT.emit(GAME_EVENT_ENUM.PLAY_AUDIO, AUDIO_EFFECT_ENUM.JIAODIZHU);
                    } else {
                        MINIDDZ_EVENT.emit(GAME_EVENT_ENUM.PLAY_AUDIO, AUDIO_EFFECT_ENUM.BUJIAO);
                    }
                }, Math.random() * 10);
            }
        } else {
            this.hideClock();
        }
    }

    showClock(seconds: number) {

        this.unschedule(this.updateClock);

        this.countdown = seconds;

        this.clockNode.active = true;
        this.timeLabel.string = seconds.toString();

        this.schedule(this.updateClock, 1);
    }

    private updateClock() {

        this.countdown--;

        this.timeLabel.string = this.countdown.toString();

        if (this.countdown <= 0) {
            this.hideClock();

        }
    }

    hideClock() {

        this.unschedule(this.updateClock);

        this.clockNode.active = false;
    }

    //----------------------------------------
    // 手牌
    //----------------------------------------

    clearHandCards() {

        this.cardRoot.removeAllChildren();

    }

    getCardRoot() {

        return this.cardRoot;

    }

    //----------------------------------------
    // 出牌区
    //----------------------------------------

    clearOutCards() {

        this.outCardRoot.removeAllChildren();

    }

    getOutCardRoot() {

        return this.outCardRoot;

    }
    showHandCards(cards: Card[]) {
        this.clearHandCards();

        let index = 0;

        this.schedule(() => {
            if (index >= cards.length) {
                return;
            }

            const card = cards[index];

            const cardNode = cc.instantiate(this.cardPrefab);

            cardNode.parent = this.cardRoot;

            const spacing = 36;

            cardNode.x = (index - (cards.length - 1) / 2) * spacing;

            const cardView = cardNode.getComponent(CardView);

            cardView?.init(card, true);

            // ✨ 发牌音效（每张都播）
            MINIDDZ_EVENT.emit(GAME_EVENT_ENUM.PLAY_AUDIO, AUDIO_EFFECT_ENUM.FAPAI);

            index++;

        }, 0.25, cards.length - 1);
    }
    showHadddndCards(cards: Card[]) {

        this.clearHandCards();

        cards.forEach((card, index) => {

            const cardNode = cc.instantiate(this.cardPrefab);

            cardNode.parent = this.cardRoot;

            const spacing = 36;

            cardNode.x = (index - (cards.length - 1) / 2) * spacing;

            const cardView = cardNode.getComponent(CardView);

            if (cardView) {
                cardView.init(card, true);
            }

        });

    }
    showBackCards(count: number) {

        this.clearHandCards();

        if (count <= 0) {
            return;
        }

        const node = cc.instantiate(this.cardPrefab);

        node.parent = this.cardRoot;

        node.scale = 0.6;

        node.x = 0;

        const cardView = node.getComponent(CardView);
        cardView?.showBack();

        // 显示数量
        const countNode = node.getChildByName("count");
        if (countNode) {
            countNode.active = true;
            countNode.getComponent(cc.Label)!.string = count.toString();
        }

    }
    removeHandCards(count: number = 1) {

        if (this.cardRoot.childrenCount <= 0) {
            return;
        }

        const node = this.cardRoot.children[0];

        const countNode = node.getChildByName("count");
        if (!countNode) {
            return;
        }

        const label = countNode.getComponent(cc.Label)!;

        let left = parseInt(label.string);

        left -= count;

        if (left <= 0) {
            node.destroy();
            return;
        }

        label.string = left.toString();

    }
    showOutCards(cards: Card[]) {

        this.clearOutCards();

        cards.forEach((card, index) => {

            const node = cc.instantiate(this.cardPrefab);

            node.parent = this.outCardRoot;

            node.scale = 0.6;
            const spacing = 30;
            node.x = (index - (cards.length - 1) / 2) * spacing;

            const cardView = node.getComponent(CardView);

            cardView?.init(card, false);

        });

    }

    //----------------------------------------
    // 重置
    //----------------------------------------

    resetView() {
        // this.showReady(false);

        this.setLandlord(false);

        this.hideClock();

        this.clearHandCards();

        this.clearOutCards();

        this.clearSelectedCards();

    }
}