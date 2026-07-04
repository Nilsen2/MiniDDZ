import { Card, Rank, Suit } from "..//standalone/types";

const { ccclass, property } = cc._decorator;

export enum CardViewEvent {
    Selected = "standalone-card-selected",
    Unselected = "standalone-card-unselected",
}

const RANK_FRAME_INDEX: { [rank: number]: number } = {
    [Rank.Ace]: 1,
    [Rank.Two]: 2,
    [Rank.Three]: 3,
    [Rank.Four]: 4,
    [Rank.Five]: 5,
    [Rank.Six]: 6,
    [Rank.Seven]: 7,
    [Rank.Eight]: 8,
    [Rank.Nine]: 9,
    [Rank.Ten]: 10,
    [Rank.Jack]: 11,
    [Rank.Queen]: 12,
    [Rank.King]: 13,
};

const SUIT_FRAME_OFFSET: { [suit: string]: number } = {
    [Suit.Diamond]: 0,
    [Suit.Club]: 1,
    [Suit.Heart]: 2,
    [Suit.Spade]: 3,
};

const JOKER_FRAME_INDEX: { [rank: number]: number } = {
    [Rank.SmallJoker]: 54,
    [Rank.BigJoker]: 53,
};

@ccclass
export default class CardView extends cc.Component {
    @property(cc.SpriteAtlas)
    cardsSpriteAtlas: cc.SpriteAtlas | null = null;

    @property
    selectable: boolean = false;

    @property
    selectedOffsetY: number = 20;

    private card: Card | null = null;
    private selected: boolean = false;
    private touchBound: boolean = false;

    onLoad() {
        this.node.on("reset_card_flag", this.resetSelected, this);
    }

    onDestroy() {
        this.node.off("reset_card_flag", this.resetSelected, this);

        if (this.touchBound) {
            this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.touchBound = false;
        }
    }

    init(card: Card, selectable: boolean = false) {
        this.card = card;
        this.selectable = selectable;
        this.selected = false;
        this.renderCard();
        this.updateTouchEvent();
    }

    setSelectable(selectable: boolean) {
        this.selectable = selectable;
        this.updateTouchEvent();

        if (!selectable) {
            this.resetSelected();
        }
    }

    resetSelected() {
        if (!this.selected) {
            return;
        }

        this.selected = false;
        this.node.y -= this.selectedOffsetY;
    }

    private updateTouchEvent() {
        if (this.selectable && !this.touchBound) {
            this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.touchBound = true;
            return;
        }

        if (!this.selectable && this.touchBound) {
            this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.touchBound = false;
        }
    }

    private onTouchStart() {
        if (!this.card || !this.selectable) {
            return;
        }

        this.selected = !this.selected;
        this.node.y += this.selected ? this.selectedOffsetY : -this.selectedOffsetY;

        const eventName = this.selected ? CardViewEvent.Selected : CardViewEvent.Unselected;
        this.node.parent && this.node.parent.emit(eventName, this.card);
    }

    showBack() {
        if (!this.cardsSpriteAtlas) {
            return;
        }

        const sprite = this.getComponent(cc.Sprite);

        if (!sprite) {
            return;
        }

        const spriteFrame = this.cardsSpriteAtlas.getSpriteFrame("card_55");

        if (spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        }

        this.setSelectable(false);
    }

    private renderCard() {
        if (!this.card || !this.cardsSpriteAtlas) {
            return;
        }

        const sprite = this.node.getComponent(cc.Sprite);
        if (!sprite) {
            cc.warn("CardView needs a cc.Sprite component.");
            return;
        }

        const spriteKey = this.getSpriteKey(this.card);
        const spriteFrame = this.cardsSpriteAtlas.getSpriteFrame(spriteKey);

        if (!spriteFrame) {
            cc.warn(`Card sprite frame not found: ${spriteKey}`);
            return;
        }

        sprite.spriteFrame = spriteFrame;
    }

    private getSpriteKey(card: Card): string {
        if (card.suit === Suit.Joker) {
            return `card_${JOKER_FRAME_INDEX[card.rank]}`;
        }

        const suitOffset = SUIT_FRAME_OFFSET[card.suit];
        const rankIndex = RANK_FRAME_INDEX[card.rank];

        return `card_${suitOffset * 13 + rankIndex}`;
    }
}
