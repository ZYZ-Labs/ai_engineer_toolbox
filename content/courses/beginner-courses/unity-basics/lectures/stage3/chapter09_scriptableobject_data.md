# 第 9 章：ScriptableObject 与游戏数据

## 学习目标

- 理解 ScriptableObject 适合保存可复用配置。
- 把敌人数据从脚本硬编码中抽出来。
- 知道数据资产和场景对象的区别。
- 避免为每种敌人复制一套脚本。

## 9.1 为什么需要数据资产

如果敌人有速度、分数、颜色、伤害，直接写在脚本里会导致每改一种敌人都要改代码。ScriptableObject 可以把配置做成资源文件。

## 9.2 创建 EnemyData

创建脚本：

```csharp
using UnityEngine;

[CreateAssetMenu(menuName = "UnityDodge/Enemy Data")]
public class EnemyData : ScriptableObject
{
    public float speed = 3f;
    public int damage = 1;
    public int scoreValue = 10;
    public Color color = Color.red;
}
```

在 Project 面板右键：

```txt
Create -> UnityDodge -> Enemy Data
```

创建 `BasicEnemyData`。

## 9.3 使用 EnemyData

EnemyMover 修改：

```csharp
[SerializeField] private EnemyData data;

private SpriteRenderer spriteRenderer;

private void Awake()
{
    spriteRenderer = GetComponent<SpriteRenderer>();
    if (data != null)
    {
        spriteRenderer.color = data.color;
    }
}

private void Update()
{
    float speed = data != null ? data.speed : 3f;
    transform.position += Vector3.down * speed * Time.deltaTime;
}
```

Prefab 上绑定 `BasicEnemyData`。

## 9.4 什么时候不用 ScriptableObject

不要把所有东西都做成 ScriptableObject。适合放进去的是稳定配置，不适合放运行时临时状态。

| 适合 | 不适合 |
|------|--------|
| 敌人基础速度 | 当前敌人坐标 |
| 武器伤害 | 当前帧输入 |
| 关卡参数 | UI 当前闪烁状态 |
| 音量默认值 | 临时计时器 |

## 常见错误

- 在运行时直接改 ScriptableObject 资产，导致退出后数据可能被污染。
- 多个敌人共用一个数据资产，却以为每个实例有独立数据。
- 忘了给 Prefab 绑定 data。

## 本章练习

1. 创建 `EnemyData`。
2. 创建 `BasicEnemyData`。
3. 让 EnemyMover 读取速度和颜色。
4. 再创建一个 `FastEnemyData`。
5. 复制一个 Enemy Prefab 变体，绑定不同数据。

## 检查点

- 你知道 ScriptableObject 是资源数据，不是场景对象。
- 你能把硬编码参数移到数据资产。
- 你知道运行时状态不要乱放进共享数据资产。
