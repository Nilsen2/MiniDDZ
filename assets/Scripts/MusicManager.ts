// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { GAME_EVENT_ENUM, AUDIO_EFFECT_ENUM, GAME_SCENE_ENUM } from "./enum/Enum";
import { MINIDDZ_EVENT } from "./Event";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MusicManager extends cc.Component {
    public static instance: MusicManager = null!;
    @property(cc.AudioClip)
    clickButton: cc.AudioClip | null = null;
    @property(cc.AudioClip)
    clear: cc.AudioClip | null = null;
    @property(cc.AudioClip)
    buyao: cc.AudioClip | null = null;
    @property(cc.AudioClip)
    chupai: cc.AudioClip | null = null;
    @property(cc.AudioClip)
    jiaodizhu: cc.AudioClip | null = null;
    @property(cc.AudioClip)
    bujiao: cc.AudioClip | null = null;
    @property(cc.AudioClip)
    fapai: cc.AudioClip | null = null;
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
        MINIDDZ_EVENT.on(GAME_EVENT_ENUM.PLAY_AUDIO, this.onPlayAudio, this);
    }

    onDestroy() {
        // Unregister event listeners
        cc.director.off(cc.Director.EVENT_AFTER_SCENE_LAUNCH, this.onSceneLaunched, this);
        MINIDDZ_EVENT.off(GAME_EVENT_ENUM.PLAY_AUDIO, this.onPlayAudio, this);
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
            case AUDIO_EFFECT_ENUM.BUYAO:
                audioClip = this.buyao;
                break;
            case AUDIO_EFFECT_ENUM.CHUPAI:
                audioClip = this.chupai;
                break;
            case AUDIO_EFFECT_ENUM.JIAODIZHU:
                audioClip = this.jiaodizhu;
                break;
            case AUDIO_EFFECT_ENUM.BUJIAO:
                audioClip = this.bujiao;
                break;
            case AUDIO_EFFECT_ENUM.FAPAI:
                audioClip = this.fapai;
                break;
        }
        if (audioClip) {
            cc.audioEngine.playEffect(audioClip, false);
        }
    }
}
