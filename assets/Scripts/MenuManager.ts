// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { GAME_SCENE_ENUM, GAME_EVENT_ENUM, AUDIO_EFFECT_ENUM } from "./enum/Enum";
import { MINIDDZ_EVENT } from "./Event";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MenuManager extends cc.Component {
    @property(cc.Prefab)
    creatroom_prefabs: cc.Prefab = null!;

    onLoad () {
        cc.director.preloadScene(GAME_SCENE_ENUM.GAME);
    }

    onGameStart () {
        MINIDDZ_EVENT.emit(GAME_EVENT_ENUM.PLAY_AUDIO, AUDIO_EFFECT_ENUM.CLICK_BUTTON);
        cc.director.loadScene(GAME_SCENE_ENUM.GAME);
    }

    onCreateRoom() {
        const creator_Room = cc.instantiate(this.creatroom_prefabs)
        if (!creator_Room) {
            console.error("Failed to instantiate the prefab.");
            return;
        }
        creator_Room.parent = this.node
        creator_Room.zIndex = 100
    }

    // update (dt) {}
}
