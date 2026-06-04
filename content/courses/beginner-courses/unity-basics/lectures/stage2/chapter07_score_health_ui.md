# 第 7 章：分数、生命值与 UI

## 学习目标

- 创建 Canvas 和 Text UI。
- 用 GameManager 记录分数与生命值。
- 玩家受伤时更新 UI。
- 游戏结束后停止生成敌人。

## 7.1 创建 UI

在 Hierarchy 创建：

```txt
UI -> Canvas
```

在 Canvas 下创建两个 Text 对象，命名：

```txt
ScoreText
HealthText
```

如果使用 TextMeshPro，首次创建时按提示导入 TMP Essentials。

## 7.2 GameManager

创建 Empty Object，命名 `GameManager`。创建脚本：

```csharp
using TMPro;
using UnityEngine;

public class GameManager : MonoBehaviour
{
    [SerializeField] private TMP_Text scoreText;
    [SerializeField] private TMP_Text healthText;
    [SerializeField] private EnemySpawner spawner;

    private int score;
    private int health = 3;

    private void Start()
    {
        UpdateUI();
    }

    public void AddScore(int amount)
    {
        score += amount;
        UpdateUI();
    }

    public void DamagePlayer(int amount)
    {
        health -= amount;
        UpdateUI();

        if (health <= 0)
        {
            spawner.enabled = false;
            Debug.Log("Game Over");
        }
    }

    private void UpdateUI()
    {
        scoreText.text = $"Score: {score}";
        healthText.text = $"Health: {health}";
    }
}
```

把两个 Text 和 Spawner 拖到 GameManager 字段。

## 7.3 玩家通知 GameManager

PlayerController 添加引用：

```csharp
[SerializeField] private GameManager gameManager;
```

在碰撞中调用：

```csharp
private void OnTriggerEnter2D(Collider2D other)
{
    if (other.CompareTag("Enemy"))
    {
        gameManager.DamagePlayer(1);
        Destroy(other.gameObject);
    }
}
```

把 GameManager 拖到 Player 的字段。

## 7.4 加分

简单方案：敌人离开屏幕时给分。EnemyMover 添加：

```csharp
[SerializeField] private int scoreValue = 10;
[SerializeField] private GameManager gameManager;
```

但 Prefab 里的引用容易漏。新手阶段更简单的办法是 GameManager 每秒加分：

```csharp
private float scoreTimer;

private void Update()
{
    scoreTimer += Time.deltaTime;
    if (scoreTimer >= 1f)
    {
        scoreTimer = 0f;
        AddScore(10);
    }
}
```

## 常见错误

- Text 引用没拖，运行时报 NullReferenceException。
- GameManager 和 Player 互相找对象，依赖混乱。
- UI 在 Game 视图里看不到，通常是 Canvas 或 RectTransform 位置问题。
- TMP 没导入 Essentials。

## 本章练习

1. 创建 ScoreText 和 HealthText。
2. 创建 GameManager。
3. 玩家碰到敌人扣血。
4. 每秒加 10 分。
5. 生命为 0 时禁用 Spawner。

## 检查点

- 你知道 UI 引用要在 Inspector 里绑定。
- 你会把全局分数生命值放在 GameManager。
- 你知道 Game Over 需要停止生成逻辑。
