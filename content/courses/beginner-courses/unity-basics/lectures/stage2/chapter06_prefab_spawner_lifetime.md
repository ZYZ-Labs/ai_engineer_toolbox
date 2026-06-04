# 第 6 章：Prefab、生成器与对象生命周期

## 学习目标

- 把 Enemy 做成 Prefab。
- 用 Spawner 定时生成敌人。
- 让敌人移动并离开屏幕后销毁。
- 理解 Instantiate 和 Destroy。

## 6.1 创建 Prefab

把 Hierarchy 中的 Enemy 拖到 `Assets/Prefabs`，生成 `Enemy.prefab`。Prefab 是可复用模板，适合敌人、子弹、道具这类重复对象。

删除场景里的临时 Enemy，后续由 Spawner 生成。

## 6.2 EnemyMover 脚本

创建 `EnemyMover.cs`：

```csharp
using UnityEngine;

public class EnemyMover : MonoBehaviour
{
    [SerializeField] private float speed = 3f;
    [SerializeField] private float destroyY = -6f;

    private void Update()
    {
        transform.position += Vector3.down * speed * Time.deltaTime;

        if (transform.position.y < destroyY)
        {
            Destroy(gameObject);
        }
    }
}
```

把脚本挂到 Enemy Prefab。

## 6.3 创建 Spawner

在 Hierarchy 创建 Empty Object，命名 `EnemySpawner`。创建脚本：

```csharp
using UnityEngine;

public class EnemySpawner : MonoBehaviour
{
    [SerializeField] private GameObject enemyPrefab;
    [SerializeField] private float spawnInterval = 1f;
    [SerializeField] private float xRange = 4.2f;
    [SerializeField] private float spawnY = 5.5f;

    private float timer;

    private void Update()
    {
        timer += Time.deltaTime;
        if (timer >= spawnInterval)
        {
            timer = 0f;
            SpawnEnemy();
        }
    }

    private void SpawnEnemy()
    {
        Vector3 position = new Vector3(Random.Range(-xRange, xRange), spawnY, 0f);
        Instantiate(enemyPrefab, position, Quaternion.identity);
    }
}
```

把 `Enemy.prefab` 拖到 Spawner 的 `enemyPrefab` 字段。

## 6.4 生命周期

`Instantiate` 创建对象。`Destroy` 销毁对象。临时对象如果不销毁，场景会越来越重。

敌人生命周期：

1. Spawner 实例化 Enemy。
2. Enemy 每帧向下移动。
3. 碰到玩家或离开屏幕后销毁。

## 常见错误

- 忘了给 `enemyPrefab` 赋值，运行时报 null。
- 修改场景里的旧 Enemy，却忘了改 Prefab。
- 生成间隔太短，场景对象暴增。
- 生成位置在墙外或屏幕外。

## 本章练习

1. 创建 Enemy Prefab。
2. 创建 EnemyMover。
3. 创建 EnemySpawner。
4. 每 1 秒从顶部随机生成敌人。
5. 离开屏幕后自动销毁。

## 检查点

- 你知道 Prefab 是可复用模板。
- 你会用 Instantiate 生成对象。
- 你会用 Destroy 清理临时对象。
