# 第 10 章：场景切换、存档与项目结构

## 学习目标

- 创建菜单场景和游戏场景。
- 用 SceneManager 切换场景。
- 保存最高分。
- 整理 Unity 项目目录。

## 10.1 添加菜单场景

创建新场景：

```txt
Assets/Scenes/MainMenu.unity
```

放一个 Canvas、标题 Text、Start Button。按钮点击后加载游戏场景。

## 10.2 SceneManager

创建 `MenuController.cs`：

```csharp
using UnityEngine;
using UnityEngine.SceneManagement;

public class MenuController : MonoBehaviour
{
    public void StartGame()
    {
        SceneManager.LoadScene("Main");
    }
}
```

把脚本挂到菜单对象上，在 Button 的 OnClick 中选择 `MenuController.StartGame`。

## 10.3 Build Settings

打开 File -> Build Profiles 或 Build Settings，把两个场景加入构建列表：

```txt
0 MainMenu
1 Main
```

场景不在列表里时，`LoadScene` 可能失败。

## 10.4 保存最高分

简单本地最高分可以用 PlayerPrefs：

```csharp
int bestScore = PlayerPrefs.GetInt("BestScore", 0);

if (score > bestScore)
{
    PlayerPrefs.SetInt("BestScore", score);
    PlayerPrefs.Save();
}
```

PlayerPrefs 适合小型设置和简单分数，不适合复杂存档。复杂存档应使用 JSON 文件、数据库或平台存档方案。

## 10.5 推荐目录结构

```txt
Assets/
  Art/
  Audio/
  Data/
  Materials/
  Prefabs/
  Scenes/
  Scripts/
  UI/
```

脚本也可以按职责拆分：

```txt
Scripts/
  Gameplay/
  UI/
  Data/
  Managers/
```

## 常见错误

- 场景没加入 Build Settings，切换时报错。
- Button OnClick 没绑定对象或方法。
- 用 PlayerPrefs 存复杂对象，后期迁移困难。
- 目录按文件类型和功能混乱嵌套，越做越找不到资源。

## 本章练习

1. 创建 MainMenu 场景。
2. 添加 Start Button。
3. 点击按钮加载 Main 场景。
4. 把两个场景加入构建列表。
5. 保存并读取最高分。

## 检查点

- 你知道场景切换需要 SceneManager。
- 你知道构建列表决定哪些场景可打包。
- 你知道 PlayerPrefs 只适合简单数据。
