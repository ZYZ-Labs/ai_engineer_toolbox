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
  },
  {
    slug: "ai-agent-engineering",
    title: "AI Agent Engineering",
    summary: "A comprehensive course for backend engineers learning AI Agent development: manual agent construction, AI-assisted development, MCP/LSP/A2A protocols, task orchestration, and production engineering.",
    badges: ["Python / Node / Go / Java", "MCP / LSP / A2A", "40 chapters", "Runnable labs"],
    stages: [
      {
        slug: "stage1",
        number: 1,
        title: "Agent 核心与古法手写",
        titleEn: "Agent Core — Manual Implementation",
        duration: "1-2 weeks",
        chapters: [
          chapter("stage1", 1, "从函数到 Agent：概念与边界", "From Functions to Agents", "chapter01_what_is_agent.md"),
          chapter("stage1", 2, "环境配置与第一次 LLM 调用", "Environment and First LLM Call", "chapter02_first_llm_call.md"),
          chapter("stage1", 3, "LLM 推理参数全解", "LLM Call Parameters Explained", "chapter03_llm_parameters.md"),
          chapter("stage1", 4, "手写 ReAct：思考-行动-观察循环", "Handwritten ReAct Loop", "chapter04_react_loop.md"),
          chapter("stage1", 5, "Tool Calling 从零实现", "Tool Calling from Scratch", "chapter05_tool_calling.md"),
          chapter("stage1", 6, "记忆系统：上下文与向量检索", "Memory: Context and Vectors", "chapter06_memory_systems.md"),
          chapter("stage1", 7, "规划与自我纠错", "Planning and Self-Recovery", "chapter07_planning_recovery.md"),
          chapter("stage1", 8, "Agent 评估：如何判断做对了", "How to Evaluate an Agent", "chapter08_agent_evaluation.md")
        ]
      },
      {
        slug: "stage2",
        number: 2,
        title: "协议生态：MCP / LSP / A2A",
        titleEn: "Protocol Ecosystem",
        duration: "1-2 weeks",
        chapters: [
          chapter("stage2", 9, "Function Calling 与 JSON Mode 深度解析", "Function Calling vs JSON Mode", "chapter09_function_json_mode.md"),
          chapter("stage2", 10, "MCP 协议导论", "MCP Protocol Primer", "chapter10_mcp_intro.md"),
          chapter("stage2", 11, "手写 MCP Server（stdio）", "Handwritten MCP Server (stdio)", "chapter11_mcp_server_stdio.md"),
          chapter("stage2", 12, "MCP Client 与 SSE/HTTP Transport", "MCP Client and Transports", "chapter12_mcp_client_transport.md"),
          chapter("stage2", 13, "LSP 协议与最小实现", "LSP Protocol and Minimum Server", "chapter13_lsp_minimum.md"),
          chapter("stage2", 14, "LSP + Tree-sitter：让 Agent 读懂代码", "LSP + Tree-sitter for Agents", "chapter14_lsp_treesitter.md"),
          chapter("stage2", 15, "A2A 协议：Agent 间协作", "A2A: Agent-to-Agent Protocol", "chapter15_a2a_protocol.md"),
          chapter("stage2", 16, "协议选型与组合架构", "When to Use Which Protocol", "chapter16_protocol_selection.md")
        ]
      },
      {
        slug: "stage3",
        number: 3,
        title: "AI 辅助开发",
        titleEn: "AI-Assisted Development",
        duration: "1 week",
        chapters: [
          chapter("stage3", 17, "Prompt-First Development", "Prompt-First Development", "chapter17_prompt_first_dev.md"),
          chapter("stage3", 18, "上下文工程：规则文件与代码库理解", "Context Engineering Rules", "chapter18_context_engineering.md"),
          chapter("stage3", 19, "AI 辅助编码工具链对比", "AI Coding Toolchains", "chapter19_ai_coding_tools.md"),
          chapter("stage3", 20, "用 AI 生成后端代码", "AI-Generated Backend Code", "chapter20_ai_backend_generation.md"),
          chapter("stage3", 21, "AI 辅助代码审查", "AI-Assisted Code Review", "chapter21_ai_code_review.md"),
          chapter("stage3", 22, "Vibe Coding 的边界", "Limits of Vibe Coding", "chapter22_vibe_coding_limits.md"),
          chapter("stage3", 23, "AI 生成代码的验证策略", "Verifying AI-Generated Code", "chapter23_ai_output_verification.md"),
          chapter("stage3", 24, "实战：用 AI 辅助重构后端服务", "Practice: AI-Assisted Refactor", "chapter24_ai_refactor_practice.md")
        ]
      },
      {
        slug: "stage4",
        number: 4,
        title: "任务编排与多 Agent 系统",
        titleEn: "Task Orchestration and Multi-Agent Systems",
        duration: "1-2 weeks",
        chapters: [
          chapter("stage4", 25, "工作流编排：从状态机到 DAG", "From State Machines to DAGs", "chapter25_workflow_orchestration.md"),
          chapter("stage4", 26, "多 Agent 协作模式", "Multi-Agent Collaboration Patterns", "chapter26_multi_agent_patterns.md"),
          chapter("stage4", 27, "长任务：幂等、重试、超时、中断恢复", "Idempotency, Retry, Timeout, Recovery", "chapter27_long_task_reliability.md"),
          chapter("stage4", 28, "人工介入点", "Human-in-the-Loop", "chapter28_human_in_the_loop.md"),
          chapter("stage4", 29, "LangGraph 实战", "LangGraph Practice", "chapter29_langgraph_practice.md"),
          chapter("stage4", 30, "Temporal 与事件驱动编排", "Temporal and Event-Driven Flows", "chapter30_temporal_orchestration.md"),
          chapter("stage4", 31, "实战：代码审查 Agent 流水线", "Practice: Code Review Agent Pipeline", "chapter31_code_review_agent.md"),
          chapter("stage4", 32, "实战：自动化运维 Agent", "Practice: Automated SRE Agent", "chapter32_sre_agent.md")
        ]
      },
      {
        slug: "stage5",
        number: 5,
        title: "工程化、部署与安全",
        titleEn: "Production Engineering, Deployment, and Security",
        duration: "1 week",
        chapters: [
          chapter("stage5", 33, "Agent 安全", "Agent Security", "chapter33_agent_security.md"),
          chapter("stage5", 34, "测试策略与 Evals", "Testing and Evals", "chapter34_testing_evals.md"),
          chapter("stage5", 35, "可观测性", "Observability", "chapter35_observability.md"),
          chapter("stage5", 36, "成本优化与缓存", "Cost Optimization and Caching", "chapter36_cost_optimization.md"),
          chapter("stage5", 37, "部署架构", "Deployment Architectures", "chapter37_deployment.md"),
          chapter("stage5", 38, "多语言 Agent 实现对比", "Multi-Language Agent Comparison", "chapter38_multilingual_agents.md"),
          chapter("stage5", 39, "课程大项目：自动化后端开发助手", "Capstone: Backend Development Assistant", "chapter39_capstone_project.md"),
          chapter("stage5", 40, "总结与进阶路线", "Summary and Advanced Roadmap", "chapter40_roadmap.md")
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
