// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { GAME_SCENE_ENUM, GAME_EVENT_ENUM, AUDIO_EFFECT_ENUM } from "./enum/Enum";
import { PLAY_AUDIO } from "./Event";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    onLoad () {
        console.log("MenuManager onLoad");
        cc.director.preloadScene(GAME_SCENE_ENUM.GAME);
    }

    onGameStart () {
        console.log("onGameStart");
        PLAY_AUDIO.emit(GAME_EVENT_ENUM.PLAY_AUDIO, AUDIO_EFFECT_ENUM.CLICK_BUTTON);
        cc.director.loadScene(GAME_SCENE_ENUM.GAME);
    }

    // update (dt) {}
}
