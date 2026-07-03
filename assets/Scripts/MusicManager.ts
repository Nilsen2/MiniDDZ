// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { GAME_EVENT_ENUM, AUDIO_EFFECT_ENUM, GAME_SCENE_ENUM } from "./enum/Enum";
import { PLAY_AUDIO } from "./Event";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MusicManager extends cc.Component {
    public static instance: MusicManager = null!;
    @property(cc.AudioClip)
    clickButton: cc.AudioClip | null = null;
    @property(cc.AudioClip)
    clear: cc.AudioClip | null = null;
    @property(cc.AudioClip)
    clickBlock: cc.AudioClip | null = null;
    @property(cc.AudioClip)
    lose: cc.AudioClip | null = null;
    @property(cc.AudioClip)
    win: cc.AudioClip | null = null;
    @property(cc.AudioClip)
    mainBgm: cc.AudioClip | null = null;
    @property(cc.AudioClip)
    gameBgm: cc.AudioClip | null = null;
    @property(cc.AudioSource)
    audioSource: cc.AudioSource | null = null;

    onLoad () {
        if (MusicManager.instance) {
            this.node.destroy();
            return;
        }

        MusicManager.instance = this;
        cc.game.addPersistRootNode(this.node);
        // Register event listeners
        cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, this.onSceneLaunched, this);
        // Register event listener for audio playback
        PLAY_AUDIO.on(GAME_EVENT_ENUM.PLAY_AUDIO, this.onPlayAudio, this);
    }

    onDestroy() {
        // Unregister event listeners
        cc.director.off(cc.Director.EVENT_AFTER_SCENE_LAUNCH, this.onSceneLaunched, this);
        PLAY_AUDIO.off(GAME_EVENT_ENUM.PLAY_AUDIO, this.onPlayAudio, this);
        if (MusicManager.instance === this) {
            MusicManager.instance = null!;
        }
    }

    onSceneLaunched() {
        let currentScene = cc.director.getScene()?.name;
        this.updateBackGroundMusic(currentScene);
    }

    updateBackGroundMusic(sceneName?: string) {
        if (!this.audioSource) {
            console.error("AudioSource is not assigned in MusicManager.");
            return;
        }

        let bgm: cc.AudioClip | null = null;

        if (sceneName === GAME_SCENE_ENUM.MENU) {
            bgm = this.mainBgm;
        } else if (sceneName === GAME_SCENE_ENUM.GAME) {
            bgm = this.gameBgm;
        }

        if (!bgm) {
            return;
        }

        if (this.audioSource.clip === bgm && this.audioSource.isPlaying) {
            return;
        }

        this.audioSource.stop();
        this.audioSource.clip = bgm;
        this.audioSource.loop = true;
        this.audioSource.play();
    }

    onPlayAudio(type: AUDIO_EFFECT_ENUM) {
        let audioClip: cc.AudioClip | null = null;
        switch (type) {
            case AUDIO_EFFECT_ENUM.CLICK_BUTTON:
                audioClip = this.clickButton;
                break;
            case AUDIO_EFFECT_ENUM.CLEAR:
                audioClip = this.clear;
                break;
            case AUDIO_EFFECT_ENUM.CLICK_BLOCK:
                audioClip = this.clickBlock;
                break;
            case AUDIO_EFFECT_ENUM.LOSE:
                audioClip = this.lose;
                break;
            case AUDIO_EFFECT_ENUM.WIN:
                audioClip = this.win;
                break;
        }
        if (audioClip) {
            cc.audioEngine.playEffect(audioClip, false);
        }
    }
}
