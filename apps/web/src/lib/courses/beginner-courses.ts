import { readFile } from "node:fs/promises";
import path from "node:path";

export type BeginnerCourse = {
  slug: string;
  title: string;
  summary: string;
  badges: string[];
  stages: BeginnerCourseStage[];
};

export type BeginnerCourseStage = {
  slug: string;
  number: number;
  title: string;
  titleEn: string;
  duration: string;
  chapters: BeginnerCourseChapter[];
};

export type BeginnerCourseChapter = {
  stage: string;
  slug: string;
  number: number;
  title: string;
  titleEn: string;
  file: string;
};

const contentRoot = path.join(process.cwd(), "../../content/courses/beginner-courses");

export const beginnerCourses: BeginnerCourse[] = [
  {
    slug: "git-basics",
    title: "Git Beginner Course",
    summary: "A command-line Git course for new developers, from first commit to branches, remotes, conflicts, and safe daily collaboration.",
    badges: ["Command-line labs", "Beginner friendly"],
    stages: [
      {
        slug: "stage1",
        number: 1,
        title: "Git 心智模型与本地仓库",
        titleEn: "Mental Model and Local Repositories",
        duration: "2-3 days",
        chapters: [
          chapter("stage1", 1, "安装、配置与第一条命令", "Install, Configure, and Run Git", "chapter01_install_setup.md"),
          chapter("stage1", 2, "仓库、工作区与状态", "Repository, Working Tree, and Status", "chapter02_repository_status.md"),
          chapter("stage1", 3, "暂存、提交与历史", "Staging, Commits, and History", "chapter03_add_commit_log.md")
        ]
      },
      {
        slug: "stage2",
        number: 2,
        title: "分支、合并与撤销",
        titleEn: "Branches, Merges, and Undoing",
        duration: "3-4 days",
        chapters: [
          chapter("stage2", 4, "分支是怎么工作的", "How Branches Work", "chapter04_branch_switch.md"),
          chapter("stage2", 5, "合并、冲突与解决顺序", "Merging, Conflicts, and Resolution", "chapter05_merge_conflict.md"),
          chapter("stage2", 6, "安全撤销：restore、reset、revert", "Safe Undo: restore, reset, revert", "chapter06_restore_reset_revert.md")
        ]
      },
      {
        slug: "stage3",
        number: 3,
        title: "远端协作与日常规范",
        titleEn: "Remote Collaboration and Daily Workflow",
        duration: "4-5 days",
        chapters: [
          chapter("stage3", 7, "remote、fetch、pull、push", "Remote, Fetch, Pull, and Push", "chapter07_remote_fetch_pull_push.md"),
          chapter("stage3", 8, "Pull Request 协作流程", "Pull Request Collaboration", "chapter08_pull_request_workflow.md"),
          chapter("stage3", 9, ".gitignore、stash 与 tag", ".gitignore, stash, and tags", "chapter09_ignore_stash_tag.md"),
          chapter("stage3", 10, "新手排错清单与安全习惯", "Troubleshooting and Safe Habits", "chapter10_troubleshooting_habits.md")
        ]
      }
    ]
  },
  {
    slug: "godot-basics",
    title: "Godot 4.6.3 Beginner Course",
    summary: "A Godot 4.6.3 course for first-time game makers, from editor concepts to a playable 2D game, UI, audio, export, and project structure.",
    badges: ["Godot 4.6.3", "2D game project"],
    stages: [
      {
        slug: "stage1",
        number: 1,
        title: "Godot 入门与核心概念",
        titleEn: "Godot Basics and Core Concepts",
        duration: "3-4 days",
        chapters: [
          chapter("stage1", 1, "安装、版本选择与编辑器", "Install, Version Choice, and Editor", "chapter01_install_editor.md"),
          chapter("stage1", 2, "节点、场景与项目结构", "Nodes, Scenes, and Project Structure", "chapter02_nodes_scenes.md"),
          chapter("stage1", 3, "GDScript 基础语法", "GDScript Fundamentals", "chapter03_gdscript_basics.md")
        ]
      },
      {
        slug: "stage2",
        number: 2,
        title: "做一个可玩的 2D 小游戏",
        titleEn: "Build a Playable 2D Game",
        duration: "1-2 weeks",
        chapters: [
          chapter("stage2", 4, "玩家角色与移动", "Player Character and Movement", "chapter04_player_movement.md"),
          chapter("stage2", 5, "碰撞、物理与地图边界", "Collisions, Physics, and Boundaries", "chapter05_collision_physics.md"),
          chapter("stage2", 6, "敌人、计时器与生成点", "Enemies, Timers, and Spawning", "chapter06_enemy_spawn.md"),
          chapter("stage2", 7, "分数、生命值与 UI", "Score, Health, and UI", "chapter07_score_health_ui.md"),
          chapter("stage2", 8, "动画、音效与手感", "Animation, Audio, and Game Feel", "chapter08_animation_audio_feel.md")
        ]
      },
      {
        slug: "stage3",
        number: 3,
        title: "工程化、调试与发布",
        titleEn: "Engineering, Debugging, and Release",
        duration: "1 week",
        chapters: [
          chapter("stage3", 9, "资源、Autoload 与状态管理", "Resources, Autoloads, and State", "chapter09_resources_autoload.md"),
          chapter("stage3", 10, "调试、报错与版本控制", "Debugging, Errors, and Version Control", "chapter10_debugging_version_control.md"),
          chapter("stage3", 11, "导出桌面与 Web 包", "Export Desktop and Web Builds", "chapter11_export_release.md"),
          chapter("stage3", 12, "下一步：3D、架构与练习项目", "Next Steps: 3D, Architecture, and Practice", "chapter12_next_steps.md")
        ]
      }
    ]
  },
  {
    slug: "unity-basics",
    title: "Unity 6.3 LTS Beginner Course",
    summary: "A Unity 6.3 LTS course for first-time game makers, from editor fundamentals to a small 2D project, UI, audio, scene flow, and builds.",
    badges: ["Unity 6.3 LTS", "C# scripting", "2D project"],
    stages: [
      {
        slug: "stage1",
        number: 1,
        title: "Unity 入门与核心模型",
        titleEn: "Unity Basics and Core Model",
        duration: "3-4 days",
        chapters: [
          chapter("stage1", 1, "安装 Unity 6.3 LTS 与编辑器", "Install Unity 6.3 LTS and the Editor", "chapter01_install_editor.md"),
          chapter("stage1", 2, "场景、GameObject 与 Component", "Scenes, GameObjects, and Components", "chapter02_scene_gameobject_component.md"),
          chapter("stage1", 3, "C# 与 MonoBehaviour 基础", "C# and MonoBehaviour Fundamentals", "chapter03_csharp_monobehaviour.md")
        ]
      },
      {
        slug: "stage2",
        number: 2,
        title: "做一个可玩的 Unity 2D 小游戏",
        titleEn: "Build a Playable Unity 2D Game",
        duration: "1-2 weeks",
        chapters: [
          chapter("stage2", 4, "玩家移动与输入", "Player Movement and Input", "chapter04_player_movement_input.md"),
          chapter("stage2", 5, "碰撞、Rigidbody2D 与边界", "Collision, Rigidbody2D, and Boundaries", "chapter05_collision_rigidbody2d.md"),
          chapter("stage2", 6, "Prefab、生成器与对象生命周期", "Prefabs, Spawners, and Object Lifetime", "chapter06_prefab_spawner_lifetime.md"),
          chapter("stage2", 7, "分数、生命值与 UI", "Score, Health, and UI", "chapter07_score_health_ui.md"),
          chapter("stage2", 8, "动画、音效与手感", "Animation, Audio, and Game Feel", "chapter08_animation_audio_feel.md")
        ]
      },
      {
        slug: "stage3",
        number: 3,
        title: "工程化、数据与发布",
        titleEn: "Engineering, Data, and Release",
        duration: "1 week",
        chapters: [
          chapter("stage3", 9, "ScriptableObject 与游戏数据", "ScriptableObject and Game Data", "chapter09_scriptableobject_data.md"),
          chapter("stage3", 10, "场景切换、存档与项目结构", "Scene Flow, Save Data, and Project Structure", "chapter10_scene_flow_save_structure.md"),
          chapter("stage3", 11, "调试、Profiler 与 Git", "Debugging, Profiler, and Git", "chapter11_debugging_profiler_git.md"),
          chapter("stage3", 12, "构建发布与下一步", "Builds, Release, and Next Steps", "chapter12_build_release_next_steps.md")
        ]
      }
    ]
  },
  {
    slug: "unreal-basics",
    title: "Unreal Engine 5.7 Beginner Course",
    summary: "An Unreal Engine 5.7 course for first-time users, from editor basics and Blueprints to a small third-person prototype, UI, packaging, and Git/LFS.",
    badges: ["Unreal Engine 5.7", "Blueprints", "3D prototype"],
    stages: [
      {
        slug: "stage1",
        number: 1,
        title: "Unreal 入门与核心概念",
        titleEn: "Unreal Basics and Core Concepts",
        duration: "3-4 days",
        chapters: [
          chapter("stage1", 1, "安装 Unreal Engine 5.7 与编辑器", "Install Unreal Engine 5.7 and the Editor", "chapter01_install_editor.md"),
          chapter("stage1", 2, "Level、Actor 与 Component", "Levels, Actors, and Components", "chapter02_level_actor_component.md"),
          chapter("stage1", 3, "Blueprint 基础与变量事件", "Blueprint Fundamentals, Variables, and Events", "chapter03_blueprint_basics.md")
        ]
      },
      {
        slug: "stage2",
        number: 2,
        title: "做一个可玩的 Unreal 原型",
        titleEn: "Build a Playable Unreal Prototype",
        duration: "1-2 weeks",
        chapters: [
          chapter("stage2", 4, "Pawn、Character、Controller 与 GameMode", "Pawn, Character, Controller, and GameMode", "chapter04_gameplay_framework.md"),
          chapter("stage2", 5, "输入、相机与角色移动", "Input, Camera, and Character Movement", "chapter05_input_camera_movement.md"),
          chapter("stage2", 6, "碰撞、Overlap 与交互", "Collision, Overlap, and Interaction", "chapter06_collision_overlap_interaction.md"),
          chapter("stage2", 7, "UMG UI、分数与生命值", "UMG UI, Score, and Health", "chapter07_umg_score_health.md"),
          chapter("stage2", 8, "材质、音效与反馈", "Materials, Audio, and Feedback", "chapter08_materials_audio_feedback.md")
        ]
      },
      {
        slug: "stage3",
        number: 3,
        title: "工程化、调试与发布",
        titleEn: "Engineering, Debugging, and Release",
        duration: "1 week",
        chapters: [
          chapter("stage3", 9, "生成敌人、关卡规则与数据", "Spawning Enemies, Level Rules, and Data", "chapter09_spawning_rules_data.md"),
          chapter("stage3", 10, "调试、日志、性能与引用", "Debugging, Logs, Performance, and References", "chapter10_debugging_logs_performance.md"),
          chapter("stage3", 11, "打包发布与平台设置", "Packaging and Platform Settings", "chapter11_packaging_release.md"),
          chapter("stage3", 12, "Git、Git LFS 与下一步", "Git, Git LFS, and Next Steps", "chapter12_git_lfs_next_steps.md")
        ]
      }
    ]
  }
];

export const beginnerCourseChapters = beginnerCourses.flatMap((course) =>
  course.stages.flatMap((stage) => stage.chapters.map((chapterItem) => ({ course, chapter: chapterItem })))
);

function chapter(stage: string, number: number, title: string, titleEn: string, file: string): BeginnerCourseChapter {
  return {
    stage,
    slug: file.replace(/\.md$/, ""),
    number,
    title,
    titleEn,
    file
  };
}

export function findBeginnerCourse(courseSlug: string) {
  return beginnerCourses.find((course) => course.slug === courseSlug);
}

export function getBeginnerCourseStaticParams() {
  return beginnerCourses.map((course) => ({
    course: course.slug
  }));
}

export function getBeginnerChapterStaticParams() {
  return beginnerCourses.flatMap((course) =>
    course.stages.flatMap((stage) =>
      stage.chapters.map((chapterItem) => ({
        course: course.slug,
        stage: stage.slug,
        chapter: chapterItem.slug
      }))
    )
  );
}

export function findBeginnerChapter(courseSlug: string, stageSlug: string, chapterSlug: string) {
  const course = findBeginnerCourse(courseSlug);
  if (!course) return undefined;

  const chapterItem = course.stages
    .flatMap((stage) => stage.chapters)
    .find((item) => item.stage === stageSlug && item.slug === chapterSlug);

  if (!chapterItem) return undefined;
  return { course, chapter: chapterItem };
}

export function getBeginnerCourseChapters(course: BeginnerCourse) {
  return course.stages.flatMap((stage) => stage.chapters);
}

export async function readBeginnerCourseMarkdown(course: BeginnerCourse, item: BeginnerCourseChapter) {
  return readFile(path.join(contentRoot, course.slug, "lectures", item.stage, item.file), "utf8");
}
