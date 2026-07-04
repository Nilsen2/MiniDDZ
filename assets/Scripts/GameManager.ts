// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { GAME_EVENT_ENUM, AUDIO_EFFECT_ENUM, DDZ_EFFECT_ENUM, GAME_SCENE_ENUM } from "./enum/Enum";
import { MINIDDZ_EVENT } from "./Event";

import PlayerLayer from "./PlayerLayer";
import { PlayerData } from "./prefabs/PlayerView";
import { DouDizhuStandalone } from "./standalone/index";
import { Card, GamePhase, GameSnapshot } from "./standalone/types";


const {ccclass, property} = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {

    @property(PlayerLayer)
    playerLayer: PlayerLayer = null!;

    @property(cc.Node)
    selfBid: cc.Node = null!;

    @property(cc.Node)
    selfAction: cc.Node = null!;

    @property(cc.Node)
    btnReady: cc.Node = null!;

    private game = new DouDizhuStandalone();

    private gameState: GameSnapshot = null!;

    private readyMap = {
        self: false,
        left: true,
        right: true,
    };

    private roomPlayers: PlayerData[] = [
        {
            id: '1',
            name: "落花i流水",
            gold: 5000,
            isSelf: true
        },
        {
            id: '2',
            name: "王阿姨de家",
            gold: 3000,
            isSelf: false
        },
        {
            id: '3',
            name: "飞飞大作战",
            gold: 6000,
            isSelf: false
        }
    ];

    onLoad () {
        this.playerLayer.init(this.roomPlayers);
        // MINIDDZ_EVENT.on(DDZ_EFFECT_ENUM.PLAYER_READY,this.onPlayerReady,this);
        MINIDDZ_EVENT.on(DDZ_EFFECT_ENUM.PLAYER_BID,this.onPlayerBid,this);
        MINIDDZ_EVENT.on(DDZ_EFFECT_ENUM.PLAYER_PLAY,this.onPlayerPlay,this);
        MINIDDZ_EVENT.on(DDZ_EFFECT_ENUM.PLAYER_PASS,this.onPlayerPass,this);
        // MINIDDZ_EVENT.on(DDZ_EFFECT_ENUM.GAME_STATE_CHANGED,this.onPlayerBid,this);
        // MINIDDZ_EVENT.on(DDZ_EFFECT_ENUM.GAME_OVER,this.onPlayerBid,this);

    }
    onDestroy() {
        MINIDDZ_EVENT.off(DDZ_EFFECT_ENUM.PLAYER_BID,this.onPlayerBid,this);
        MINIDDZ_EVENT.off(DDZ_EFFECT_ENUM.PLAYER_PLAY,this.onPlayerPlay,this);
        MINIDDZ_EVENT.off(DDZ_EFFECT_ENUM.PLAYER_PASS,this.onPlayerPass,this);
    }

    private onPlayerPass(data: { playerId: string }) {
        const result = this.game.pass(data.playerId);
        this.gameState = result;
        if (result.currentPlayerId === "1") {
            this.selfAction.active = true;
        } else {
            this.selfAction.active = false;
            this.autoPlayForCurrentPlayer(result.currentPlayerId);
        }
    }

    autoPlayForCurrentPlayer(currentPlayerId: string | null) {
        if (!currentPlayerId) {
            console.warn("No current player to auto play for.");
            return;
        }
        this.scheduleOnce(() => {
            const snapshot = this.game.autoPlay(currentPlayerId);
            // console.log("Auto play result:", snapshot);
            if(currentPlayerId === snapshot.lastPlay?.playerId) {
                MINIDDZ_EVENT.emit(GAME_EVENT_ENUM.PLAY_AUDIO, AUDIO_EFFECT_ENUM.CHUPAI);
                this.playerLayer.showOutCards(currentPlayerId, snapshot.lastPlay?.combo.cards);
                this.playerLayer.dealCards(snapshot.players, true);
            } else {
                this.playerLayer.hideClockForPlayer(currentPlayerId);
                MINIDDZ_EVENT.emit(GAME_EVENT_ENUM.PLAY_AUDIO, AUDIO_EFFECT_ENUM.BUYAO);
            }
            if(snapshot.phase === GamePhase.GameOver) {
                console.log("Game over! Winner:", snapshot.winnerId);
                // Handle game over logic here
                return;
            }
            if (snapshot.currentPlayerId === "1") {
                this.selfAction.active = true;
            } else {
                this.selfAction.active = false;
                this.scheduleOnce(() => {
                    this.autoPlayForCurrentPlayer(snapshot.currentPlayerId);
                }, Math.random() * 8);
            }
        }, 1);
    }

    private onPlayerPlay(data: { playerId: string; cards: Card[] }) {
        // console.log("onPlayerPlay Player play:", data.cards);

        const result =
            this.game.play(
                data.playerId,
                data.cards
            );

        if (!result.success) {

            // toast
            console.log(result.error);

            return;
        }
        MINIDDZ_EVENT.emit(GAME_EVENT_ENUM.PLAY_AUDIO, AUDIO_EFFECT_ENUM.CHUPAI);
        this.selfAction.active = false;
        const gameInfo = this.game.snapshot();
        this.playerLayer.showOutCards(data.playerId, data.cards);
        this.playerLayer.dealCards(gameInfo.players, true);
        if (result.winnerId) {
            console.log("Game over! Winner:", result.winnerId);
            // Handle game over logic here
            return
        }
        this.autoPlayForCurrentPlayer(gameInfo.currentPlayerId);
    }

    onPlayerReady(data: { playerId: string }) {
        console.log("Player ready:", data);
        if (data.playerId === "1") {
            this.readyMap.self = true;
        } else if (data.playerId === "2") {
            this.readyMap.left = true;
        } else if (data.playerId === "3") {
            this.readyMap.right = true;
        }
    }

    onPlayerBid(data: { playerId: number; rob: boolean }) {
        console.log("Player bid:", data);
        this.gameState = this.game.bid(data.playerId.toString(), data.rob);
        console.log("Updated game state after bid:", this.gameState);
        this.checkBidPhase();
    }

    backToMenu() {
        cc.director.loadScene(GAME_SCENE_ENUM.MENU);
    }
    clickReady() {
        this.btnReady.active = false;
        this.readyMap.self = true;
        this.playerLayer.getSelfPlayer().showReady(true);

        this.checkStartGame();
    }
    checkStartGame() {
        if (
            this.readyMap.self &&
            this.readyMap.left &&
            this.readyMap.right
        ) {
            this.startGame();
        }

    }
    checkBidPhase() {
        if (this.gameState.phase === GamePhase.Bidding) {
            if (this.gameState.currentPlayerId === "1") {
                this.selfBid.active = true;
            } else {
                this.selfBid.active = false;
            }
            this.playerLayer.showBidPhase(this.gameState.currentPlayerId);
        } else {
            this.selfBid.active = false;
            this.playerLayer.showBidPhase(null);
            if (this.gameState.currentPlayerId === "1") {
                this.selfAction.active = true;
            } else {
                this.selfAction.active = false;
            }
            this.playerLayer.showBottomCards(this.gameState.bottomCards);
            this.playerLayer.setLandlord(this.gameState.landlordId);
            this.playerLayer.dealCards(this.gameState.players, true);
        }
        
    }
    private startGame() {

        this.gameState = this.game.start({

            playerIds: this.roomPlayers.map(v => v.id.toString()),

            playerNames: this.roomPlayers.map(v => v.name)

        });

        this.playerLayer.resetReady();

        this.playerLayer.dealCards(this.gameState.players);

        this.playerLayer.dealBottomCards();
        this.scheduleOnce(() => {
            this.checkBidPhase();
        }, Math.random() * 5);
        // console.log(this.gameState);
    }

    // update (dt) {}
}
