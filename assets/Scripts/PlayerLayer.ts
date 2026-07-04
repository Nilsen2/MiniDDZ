import PlayerView, { PlayerData } from "./prefabs/PlayerView";
import { Card } from "./standalone";
import CardView from "./prefabs/Card";


const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerLayer extends cc.Component {

    @property(PlayerView)
    leftPlayer: PlayerView = null!;

    @property(PlayerView)
    selfPlayer: PlayerView = null!;

    @property(PlayerView)
    rightPlayer: PlayerView = null!;

    @property(cc.Node)
    bottomRoot: cc.Node = null!;

    @property(cc.Prefab)
    cardPrefab: cc.Prefab = null!;

    init(players: PlayerData[]) {
        this.selfPlayer.init(players[0]);
        this.leftPlayer.init(players[1]);
        this.rightPlayer.init(players[2]);
    }
    setLandlord(playerId: string | null) {
        if (playerId === "1") {
            this.selfPlayer.setLandlord(true);
            this.leftPlayer.setLandlord(false);
            this.rightPlayer.setLandlord(false);
        } else if (playerId === "2") {
            this.selfPlayer.setLandlord(false);
            this.leftPlayer.setLandlord(true);
            this.rightPlayer.setLandlord(false);
        } else if (playerId === "3") {
            this.selfPlayer.setLandlord(false);
            this.leftPlayer.setLandlord(false);
            this.rightPlayer.setLandlord(true);
        }
    }
    hideClockForPlayer(playerId: string | null) {
        if (playerId === "1") {
            this.selfPlayer.hideClock();
        } else if (playerId === "2") {
            this.leftPlayer.hideClock();
        } else if (playerId === "3") {
            this.rightPlayer.hideClock();
        }
    }
    showOutCards(playerId: string | null, cards: Card[] | undefined) {
        if (!cards || cards.length === 0) {
            return;
        }
        if (playerId === "1") {
            this.selfPlayer.showOutCards(cards);
            this.selfPlayer.hideClock();
            this.selfPlayer.clearSelectedCards();
            this.leftPlayer.showClock(10);
            this.leftPlayer.clearOutCards();
        } else if (playerId === "2") {
            this.leftPlayer.showOutCards(cards);
            this.leftPlayer.hideClock();
            this.leftPlayer.clearSelectedCards();
            this.rightPlayer.showClock(10);
            this.rightPlayer.clearOutCards();
        } else if (playerId === "3") {
            this.rightPlayer.showOutCards(cards);
            this.rightPlayer.hideClock();
            this.rightPlayer.clearSelectedCards();
            this.selfPlayer.clearOutCards();
        }
    }
    showBidPhase(selfId: string | null) {
        if (selfId === "2") {
            this.selfPlayer.showBidPhase(false);
            this.leftPlayer.showBidPhase(true);
            this.rightPlayer.showBidPhase(false);
        } else if (selfId === "3") {
            this.selfPlayer.showBidPhase(false);
            this.leftPlayer.showBidPhase(false);
            this.rightPlayer.showBidPhase(true);
        } else if (selfId === "1") {
            this.selfPlayer.showBidPhase(true);
            this.leftPlayer.showBidPhase(false);
            this.rightPlayer.showBidPhase(false);
        } else {
            this.selfPlayer.showBidPhase(false);
            this.leftPlayer.showBidPhase(false);
            this.rightPlayer.showBidPhase(false);
        }
    }
    dealBottomCards() {

        this.bottomRoot.removeAllChildren();

        const count = 3;
        const spacing = 72;

        let index = 0;

        this.schedule(() => {

            if (index >= count) {
                return;
            }

            const cardNode = cc.instantiate(this.cardPrefab);

            cardNode.parent = this.bottomRoot;

            cardNode.scale = 0.6;

            cardNode.x = (index - (count - 1) / 2) * spacing;

            const cardView = cardNode.getComponent(CardView);

            cardView?.showBack();

            index++;

        }, 0.25, count - 1);
    }
    showBottomCards(cards: Card[]) {
        const children = this.bottomRoot.children;
        children.forEach((node, index) => {
        this.scheduleOnce(() => {
                node.runAction(
                    cc.sequence(

                        cc.scaleTo(0.08, 0, 0.6),

                        cc.callFunc(() => {
                            node.getComponent(CardView)?.init(cards[index], false);
                        }),

                        cc.scaleTo(0.08, 0.6, 0.6)
                    )
                );

            }, index * 0.12);
        });
    }
    dealCards(players: any, updateSelf: boolean = false) {

        const self = players.find((v:any) => v.id === "1");
        const left = players.find((v:any) => v.id === "2");
        const right = players.find((v:any) => v.id === "3");

        if (!self || !left || !right) {
            return;
        }

        // 自己（真实牌）
        if (updateSelf) {
            this.selfPlayer.showHadddndCards(self.hand);
        } else {
            this.selfPlayer.showHandCards(self.hand);
        }

        // 左右（背牌）
        this.leftPlayer.showBackCards(left.hand.length);
        this.rightPlayer.showBackCards(right.hand.length);
    }
    resetReady() {
        this.selfPlayer.showReady(false);
        this.leftPlayer.showReady(false);
        this.rightPlayer.showReady(false);
    }

    getSelfPlayer() {
        return this.selfPlayer;
    }

    getLeftPlayer() {
        return this.leftPlayer;
    }

    getRightPlayer() {
        return this.rightPlayer;
    }
}