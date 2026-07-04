// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { GAME_SCENE_ENUM } from "./enum/Enum";

const {ccclass} = cc._decorator;

@ccclass
export default class LoginManager extends cc.Component {

    onLoad () {
        cc.director.preloadScene(GAME_SCENE_ENUM.MENU);
    }

    guestLogin() {
        cc.director.loadScene(GAME_SCENE_ENUM.MENU);
    }

    // update (dt) {}
}
