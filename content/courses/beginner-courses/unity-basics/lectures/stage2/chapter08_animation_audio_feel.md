# 第 8 章：动画、音效与手感

## 学习目标

- 添加受伤反馈。
- 播放简单音效。
- 用参数调节难度。
- 知道手感来自反馈和节奏。

## 8.1 受伤闪烁

在 PlayerController 中缓存 SpriteRenderer：

```csharp
private SpriteRenderer spriteRenderer;

private void Awake()
{
    rb = GetComponent<Rigidbody2D>();
    spriteRenderer = GetComponent<SpriteRenderer>();
}
```

添加协程：

```csharp
private IEnumerator Flash()
{
    spriteRenderer.color = Color.red;
    yield return new WaitForSeconds(0.12f);
    spriteRenderer.color = Color.white;
}
```

文件顶部需要：

```csharp
using System.Collections;
```

受伤时调用：

```csharp
StartCoroutine(Flash());
```

## 8.2 音效

给 Player 添加 `AudioSource`，取消 Play On Awake。添加字段：

```csharp
[SerializeField] private AudioSource hitAudio;
```

碰撞时：

```csharp
hitAudio.Play();
```

音效要短。受伤反馈音超过 0.5 秒，会让频繁碰撞听起来混乱。

## 8.3 难度曲线

Spawner 可以逐渐缩短间隔：

```csharp
[SerializeField] private float minInterval = 0.3f;
[SerializeField] private float intervalDecrease = 0.02f;

private void SpawnEnemy()
{
    Vector3 position = new Vector3(Random.Range(-xRange, xRange), spawnY, 0f);
    Instantiate(enemyPrefab, position, Quaternion.identity);
    spawnInterval = Mathf.Max(minInterval, spawnInterval - intervalDecrease);
}
```

这样游戏会越来越难，但不会低于最小间隔。

## 8.4 动画怎么开始

新手可以先不用 Animator。先用颜色、缩放、音效完成反馈。等项目稳定后再加 Animator Controller。

适合后续动画的对象：

- 玩家受伤闪烁。
- UI 分数跳动。
- 敌人生成时缩放出现。
- Game Over 文案淡入。

## 常见错误

- 忘了引入 `System.Collections`，协程报错。
- AudioSource 没绑定或 AudioClip 为空。
- 难度曲线没有下限，后期每帧生成敌人。
- 反馈太多，玩家看不清主要信息。

## 本章练习

1. 玩家受伤时闪红。
2. 添加受伤音效。
3. 让生成间隔逐步降低。
4. 给最小间隔设置下限。
5. 找人试玩 1 分钟，记录是否看得懂状态。

## 检查点

- 你知道反馈是可玩性的一部分。
- 你会用协程做短暂效果。
- 你会给难度曲线设置安全下限。
