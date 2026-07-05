import CardView, { CardViewEvent } from "../prefabs/Card";
import { DouDizhuStandalone } from "./index";
import { Card, GamePhase } from "./types";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StandaloneHandExample extends cc.Component {
    @property(cc.Prefab)
    cardPrefab: cc.Prefab | null = null;

    @property(cc.Node)
    handRoot: cc.Node | null = null;

    private game: DouDizhuStandalone = new DouDizhuStandalone();
    private selectedCards: Card[] = [];

    onLoad() {
        this.getEventRoot().on(CardViewEvent.Selected, this.onCardSelected, this);
        this.getEventRoot().on(CardViewEvent.Unselected, this.onCardUnselected, this);
    }

    onDestroy() {
        this.getEventRoot().off(CardViewEvent.Selected, this.onCardSelected, this);
        this.getEventRoot().off(CardViewEvent.Unselected, this.onCardUnselected, this);
    }

    start() {
        let state = this.game.start({
            playerIds: ["self", "robotA", "robotB"],
            playerNames: ["玩家", "机器人A", "机器人B"],
        });

        state = this.game.bid(state.currentPlayerId!, true);
        state = this.game.bid(state.currentPlayerId!, false);
        state = this.game.bid(state.currentPlayerId!, true);

        const self = state.players.find(player => player.id === "self");
        if (self) {
            this.renderHand(self.hand, state.phase === GamePhase.Playing && state.currentPlayerId === "self");
        }
    }

    playSelectedCards() {
        const result = this.game.play("self", this.selectedCards);

        if (!result.success) {
            cc.warn(result.error);
            return;
        }

        this.selectedCards = [];
        this.resetHandSelection();
        this.refreshSelfHand();
    }

    private renderHand(cards: Card[], selectable: boolean) {
        if (!this.cardPrefab || !this.handRoot) {
            return;
        }

        this.handRoot.removeAllChildren();

        cards.forEach((card, index) => {
            const node = cc.instantiate(this.cardPrefab!);
            node.parent = this.handRoot!;
            node.x = index * 36;

            const cardView = node.getComponent(CardView);
            if (cardView) {
                cardView.init(card, selectable);
            }
        });
    }

    private refreshSelfHand() {
        const state = this.game.snapshot();
        const self = state.players.find(player => player.id === "self");

        if (self) {
            this.renderHand(self.hand, state.phase === GamePhase.Playing && state.currentPlayerId === "self");
        }
    }

    private onCardSelected(card: Card) {
        if (!this.selectedCards.some(item => item.id === card.id)) {
            this.selectedCards.push(card);
        }
    }

    private onCardUnselected(card: Card) {
        this.selectedCards = this.selectedCards.filter(item => item.id !== card.id);
    }

    private resetHandSelection() {
        if (!this.handRoot) {
            return;
        }

        this.handRoot.children.forEach(cardNode => {
            cardNode.emit("reset_card_flag");
        });
    }

    private getEventRoot(): cc.Node {
        return this.handRoot || this.node;
    }
}
