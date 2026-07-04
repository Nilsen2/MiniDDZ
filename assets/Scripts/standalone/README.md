# Standalone Dou Dizhu Logic

纯 TypeScript 单机斗地主核心逻辑，不依赖 Cocos 节点、场景、`window` 或 socket。

## 用法

```ts
import { DouDizhuStandalone, GamePhase } from "./standalone-ddz";

const game = new DouDizhuStandalone();

let state = game.start({
    playerIds: ["self", "robotA", "robotB"],
    playerNames: ["玩家", "机器人A", "机器人B"],
});

// 叫分，0 表示不叫，1-3 表示叫分。
state = game.bid(state.currentPlayerId!, 1);
state = game.bid(state.currentPlayerId!, 0);
state = game.bid(state.currentPlayerId!, 2);

if (state.phase === GamePhase.Playing) {
    const currentPlayer = state.players.find(player => player.id === state.currentPlayerId)!;
    const result = game.play(currentPlayer.id, [currentPlayer.hand[0]]);

    if (!result.success) {
        cc.warn(result.error);
    }
}
```

## 模块职责

- `deck.ts`: 创建牌堆、洗牌、发牌、排序。
- `rules.ts`: 牌型识别、牌型比较、手牌增删校验。
- `engine.ts`: 单机状态机，处理叫分、出牌、过牌、胜负。
- `types.ts`: 牌、玩家、状态、牌型等类型定义。

## 已支持牌型

- 单张
- 对子
- 三张
- 三带一
- 三带一对
- 顺子
- 连对
- 飞机
- 飞机带单
- 飞机带对
- 四带二
- 四带两对
- 炸弹
- 王炸
