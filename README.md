
## 预览
[欢乐斗地主](https://nilsen2.github.io/MiniDDZ/build/web-mobile/)

[我要验牌](https://nilsen2.github.io/MiniDDZ/build/web-yanpai/)


# miniDdz 项目文档

一个基于 **Cocos Creator 2.4.11**（JS 引擎 + TypeScript）实现的斗地主（Dou Dizhu）单机小样例（三人局：玩家 + 2 个本地 AI）。项目定位是"最小可玩闭环"的斗地主 Demo，重点在于把**纯逻辑的游戏规则引擎**与 **Cocos 表现层**彻底解耦。

---

## 1. 技术栈

| 项 | 值 |
|---|---|
| 引擎 | Cocos Creator 2.4.11（`cocos-creator-js`，见 [project.json](../project.json)） |
| 语言 | TypeScript（`.ts`，通过 `cc._decorator` 使用 `@ccclass/@property`） |
| 设计分辨率 | 1280×720（`fit-height`） |
| 场景数 | 3 个：`Login` → `Menu` → `Game` |
| 网络 | 无（纯本地状态机，无服务端/联机对战） |

---

## 2. 目录结构

```
assets/
├── Scenes/                 Login.fire / Menu.fire / Game.fire
├── Prefabs/                Player.prefab, card.prefab, creatRoom.prefab
├── Sprites/, Audio/        美术与音频资源
└── Scripts/
    ├── Event.ts            全局事件总线（cc.EventTarget 单例）
    ├── enum/Enum.ts         全局事件名 / 音效 / 场景名枚举
    ├── LoginManager.ts      登录场景控制器
    ├── MenuManager.ts       大厅场景控制器
    ├── MusicManager.ts      背景音乐 & 音效播放（跨场景常驻单例）
    ├── GameManager.ts       牌局场景主控制器（Game.fire 挂载）
    ├── PlayerLayer.ts       三个玩家视图的编排层
    ├── prefabs/
    │   ├── PlayerView.ts    单个玩家的 UI（手牌/出牌/倒计时/叫分…）
    │   ├── Card.ts          单张扑克牌的显示与选中交互
    │   └── CreateRoom.ts    创建房间弹窗（较简陋，见"已知问题"）
    └── standalone/          【核心】与 Cocos 无关的纯 TS 斗地主规则引擎
        ├── types.ts         Card / PlayerState / CardCombo / GameSnapshot 等类型
        ├── deck.ts          发牌：建牌堆、洗牌、排序、三人分牌
        ├── rules.ts         牌型识别（analyseCards）与大小比较（canBeat）
        ├── engine.ts        DouDizhuStandalone：完整的游戏状态机
        ├── index.ts         桶文件，统一导出 standalone 模块
        └── StandaloneHandExample.ts  引擎的独立使用示例（脱离 GameManager）
```

---

## 3. 整体架构

项目分两层，边界清晰：

```
┌─────────────────────────── Cocos 表现层 ───────────────────────────┐
│ LoginManager → MenuManager → GameManager                          │
│                                  │                                 │
│                                  ├─ PlayerLayer（编排 3 个 PlayerView）│
│                                  │        └─ PlayerView（手牌/出牌/倒计时）│
│                                  │                 └─ CardView（单张牌）│
│                                  │                                 │
│                                  └─ 持有一个 DouDizhuStandalone 实例  │
│                                            │ 调用 .start/.bid/.play/.pass │
└────────────────────────────────────────────┼──────────────────────┘
                                              ▼
┌───────────────────── standalone/ 纯逻辑引擎（无 cc 依赖）─────────────┐
│ deck.ts（洗牌发牌） + rules.ts（牌型识别/比大小） + engine.ts（状态机）│
└─────────────────────────────────────────────────────────────────┘
```

- **standalone/ 目录不 import 任何 `cc.*`**（`StandaloneHandExample.ts` 除外，它只是用法示例），可以脱离 Cocos 单独跑单元测试，也便于未来替换成真实联机对局同步的"客户端预测/服务端权威"校验逻辑。
- **通信方式**：视图层与 `GameManager` 之间通过全局事件总线 `MINIDDZ_EVENT`（[Event.ts](../assets/Scripts/Event.ts:1)，一个 `cc.EventTarget` 单例）解耦，例如 `PlayerView` 点击"出牌"只是 `emit(DDZ_EFFECT_ENUM.PLAYER_PLAY, {...})`，具体处理在 `GameManager.onPlayerPlay` 里完成，再把结果调用回 `PlayerLayer` 刷新界面。音效同理，通过 `GAME_EVENT_ENUM.PLAY_AUDIO` 事件由 `MusicManager` 统一播放，业务代码不直接持有 AudioClip。

---

## 4. 核心数据模型（`standalone/types.ts`）

- `Card { id, rank, suit }`：`rank` 用数值枚举 3~17（3 到 2，外加 SmallJoker=16 / BigJoker=17，方便直接数值比大小）；`suit` 含 `joker`。
- `PlayerState { id, name, hand, isLandlord }`
- `CardComboType`：单/对/三/三带一/三带二/顺子/连对/飞机(不带、带单、带对)/四带二(单/对)/炸弹/火箭，共 14 种。
- `CardCombo { type, mainRank, length, cards, sequenceLength? }`：`mainRank` 是比较大小的基准点数，`sequenceLength` 用于顺子/连对/飞机的"节数"。
- `GameSnapshot`：每次操作后返回给表现层的**只读快照**（phase、players、landlordId、bottomCards、currentPlayerId、lastPlay、winnerId、passCount、bidHistory），`GameManager` 只依赖这个快照渲染 UI，不直接碰引擎内部状态。

---

## 5. 规则引擎细节

### 5.1 发牌（`deck.ts`）
- `createDeck()`：52 张常规牌 + 大小王 = 54 张。
- `shuffleCards(cards, random?)`：Fisher–Yates 洗牌，`random` 可注入（默认 `Math.random`），**便于单元测试用可控随机源**。
- `dealThreePlayers(deck)`：强制要求 54 张，切成 17/17/17/3（最后 3 张是底牌），每人手牌用 `sortCards` 按点数降序、同点数按花色字符串排序。

### 5.2 牌型识别与比较（`rules.ts`）
- `analyseCards(cards)`：核心识别函数，按"火箭 → 单张计数(单/对/三/炸) → 三带一/三带二 → 顺子(≥5,不含2/王) → 连对(≥3对) → 飞机(不带/带单/带对) → 四带二(单/对)"顺序逐一匹配，任何一种都不匹配则返回 `null`（非法牌型）。
- `canBeat(current, target)`：
  - 目标是火箭 → 谁都打不过（返回 false）。
  - 当前是火箭 → 必赢。
  - 当前是炸弹、目标不是炸弹 → 必赢。
  - 否则要求**同牌型 + 同长度 + mainRank 更大**才算压过。
  - 注意：**炸弹之间、顺子/连对/飞机之间的比较仍然是走"同类型同长度比 mainRank"这条通用分支**，逻辑是对的（炸弹 vs 炸弹走的是第 4 个分支之后的通用分支）。
- `containsCards` / `removeCards`：校验选中的牌是否都在手牌里、以及从手牌中扣除已出的牌，用 `id` 做唯一匹配（避免同点数不同花色误删）。

### 5.3 游戏状态机（`engine.ts` → `DouDizhuStandalone`）

一个类完整封装了一局游戏的生命周期：

| 方法 | 作用 |
|---|---|
| `start(options)` | 校验必须 3 人 → 洗牌发牌 → 进入 `Bidding` 阶段，随机决定首个叫分玩家 |
| `bid(playerId, rob)` | 叫地主（目前只支持 布尔的"抢/不抢"，不是 0~3 分的完整叫分制，见下方"已知问题"）；抢到 3 分或连续叫满 3 人后调用 `confirmLandlord()` |
| `confirmLandlord()`（私有） | 确定地主：取最高分记录的玩家，若无人抢分则默认玩家 0 是地主；地主手牌并入底牌，进入 `Playing` 阶段 |
| `play(playerId, cards)` | 校验轮到该玩家 → 校验牌在手上 → `analyseCards` 校验牌型合法 → 若非本轮领出则需 `canBeat` 过 `lastPlay` → 扣牌、清空 `passCount`；手牌为空则直接判定 `GameOver` 并返回 `winnerId` |
| `pass(playerId)` | 领出方不能 pass；连续 2 家 pass 后回到上一个出牌人重新领出（`lastPlay` 清空） |
| `getHint(playerId)` / `autoPlay(playerId)` | AI/提示逻辑：自己领出或刚拿回牌权时出手牌里最大的一张；否则按"单张→对子→三张→炸弹→火箭"顺序找刚好能压过的牌，找不到就自动 pass |
| `snapshot()` | 生成对外只读快照 |

**状态机图**：

```
Idle --start()--> Bidding --bid()x1~3--> Playing --play()(手牌清空)--> GameOver
                                             ^  |
                                             |  play()/pass() 循环，直到有人手牌为0
                                             +--+
```

---

## 6. 表现层细节

### 6.1 `GameManager.ts`（Game 场景总控）
- 持有 `roomPlayers`（**目前是写死的 3 个假数据**，id 固定为 `"1"/"2"/"3"`，`"1"` 恒为本人），以及一个 `DouDizhuStandalone` 实例。
- 监听 `PLAYER_BID / PLAYER_PLAY / PLAYER_PASS` 三个事件，调用引擎对应方法后，把返回的快照喂给 `PlayerLayer` 做渲染（发牌动画、亮/隐倒计时、显示出牌、显示地主标记等）。
- **AI 托管**：非本人回合时调用 `autoPlayForCurrentPlayer`，用 `scheduleOnce` 模拟"思考延迟"（叫分 0~10s 随机，出牌后 0~8s 随机）再调用引擎的 `autoPlay`。
- `checkStartGame`/`clickReady`：本地"准备"逻辑，`readyMap` 里左右两家写死为 `true`（即只要本人点准备就会开局），说明这是**单机演示**，并未真正等待其他玩家。

### 6.2 `PlayerLayer.ts`
纯粹的"路由/编排"层：根据 `playerId`（字符串 "1"/"2"/"3"）把动作分发给 `selfPlayer / leftPlayer / rightPlayer` 三个 `PlayerView` 实例，处理发牌、亮出底牌、标记地主、显示出牌/倒计时等。硬编码字符串 id 判断（`"1"|"2"|"3"`）出现较多，属于可以重构收敛的重复逻辑。

### 6.3 `PlayerView.ts`
单个玩家的完整 UI 行为：
- 头像/昵称/金币展示。
- 叫分/抢地主：`showBidPhase(active)` 中，如果不是本人（`isSelf=false`）会**自动模拟 AI 随机抢/不抢**并直接 emit 出叫分事件（意味着 AI 的"叫分决策"实际上散落在视图层，而不是在 `standalone` 引擎里，这是与"出牌 AI 在 engine.ts 里"不一致的地方，见"已知问题"）。
- 出牌区/手牌区节点管理、倒计时（`schedule(updateClock, 1)`）。
- `showHandCards`（带 0.25s 间隔的逐张发牌动画+音效）与 `showHadddndCards`（⚠️ 命名疑似手误，应为 `showHandCards` 的"立即刷新版"，见下）两套刷新手牌的方法。
- 选牌通过监听 `cardRoot` 上冒泡的 `CardViewEvent.Selected/Unselected` 事件维护 `selectedCards`。

### 6.4 `Card.ts`（`CardView`）
- 用一张 `cc.SpriteAtlas` + 数值到帧名的映射表（`RANK_FRAME_INDEX` / `SUIT_FRAME_OFFSET` / `JOKER_FRAME_INDEX`）拼出精灵帧名 `card_N`。
- 点击切换选中态（上移 `selectedOffsetY` 像素）并 `emit` 选中/取消选中事件，供父节点（`PlayerView`/`StandaloneHandExample`）收集。
- `showBack()` 显示牌背（用于对手手牌、底牌翻开前）。

### 6.5 事件与音效
- [enum/Enum.ts](../assets/Scripts/enum/Enum.ts:1) 定义了 4 组枚举：全局事件名（`GAME_EVENT_ENUM`）、斗地主动作事件（`DDZ_EFFECT_ENUM`）、音效类型（`AUDIO_EFFECT_ENUM`）、场景名（`GAME_SCENE_ENUM`）。
- `MusicManager` 是常驻节点单例（`cc.game.addPersistRootNode`），监听场景切换自动换 BGM，并监听 `PLAY_AUDIO` 事件统一播放音效，业务代码全程不直接接触 `cc.AudioClip`。

### 6.6 场景流程
`Login.fire`（`LoginManager`，游客登录直接进 Menu）→ `Menu.fire`（`MenuManager`，预加载 Game 场景，"开始游戏"直接进 Game；"创建房间"弹出 `CreateRoom` 预制体）→ `Game.fire`（`GameManager` 驱动一整局）。