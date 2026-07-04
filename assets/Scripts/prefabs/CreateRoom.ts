
import { GAME_SCENE_ENUM } from "../enum/Enum";

const {ccclass, property} = cc._decorator;
@ccclass
export default class NewClass extends cc.Component {
    onBtnClose() {
        this.node.destroy()
    }
    onButtonClick(_event: cc.Event, value: string) {
        console.log("Button clicked with value:", value);
        cc.director.loadScene(GAME_SCENE_ENUM.GAME)
        this.node.destroy()
    }
}
