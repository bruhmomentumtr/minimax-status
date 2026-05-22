#!/usr/bin/env node

// Force color output even in non-TTY environments (e.g., Claude Code statusline)
process.env.FORCE_COLOR = "1";

const { Command } = require("commander");
const chalk = require("chalk").default;
const ora = require("ora").default;
const MinimaxAPI = require("./api");
const StatusBar = require("./status");
const TranscriptParser = require("./transcript-parser");
const ConfigCounter = require("./config-counter");
const Renderer = require("./renderer");
const packageJson = require("../package.json");
const { getContextWindowSize, getDefaultContextWindowSize } = require('./model-context-sizes');

const program = new Command();
const api = new MinimaxAPI();
const transcriptParser = new TranscriptParser();
const configCounter = new ConfigCounter();
const renderer = new Renderer();

program
  .name("minimax-status")
  .description("MiniMax Claude Code usage monitoring tool")
  .version(packageJson.version);

// Auth command (Configure credentials)
program
  .command("auth")
  .description("Configure credentials")
  .argument("<token>", "MiniMax access token")
  .argument("[groupId]", "MiniMax Group ID (deprecated, optional)")
  .action((token, groupId) => {
    api.setCredentials(token, groupId || null);
    console.log(chalk.green("✓ Authentication saved"));
  });

// Health check command (Check configuration and connection status)
program
  .command("health")
  .description("Check configuration and connection status")
  .action(async () => {
    const spinner = ora("Checking...").start();
    let checks = {
      config: false,
      token: false,
      groupId: false,
      api: false,
    };

    // Check config file
    try {
      const configPath = require("path").join(
        process.env.HOME || process.env.USERPROFILE,
        ".minimax-config.json"
      );
      if (require("fs").existsSync(configPath)) {
        checks.config = true;
      }
      spinner.succeed("Config file check");
    } catch (error) {
      spinner.fail("Config file check failed");
    }

    // Check Token
    if (api.token) {
      checks.token = true;
      console.log(chalk.green("✓ Token: ") + chalk.gray("configured"));
    } else {
      console.log(chalk.red("✗ Token: ") + chalk.gray("not configured"));
    }

    // Check GroupID
    if (api.groupId) {
      checks.groupId = true;
      console.log(chalk.green("✓ GroupID: ") + chalk.gray("configured"));
    } else {
      console.log(chalk.red("✗ GroupID: ") + chalk.gray("not configured"));
    }

    // Test API connection
    if (checks.token && checks.groupId) {
      try {
        await api.getUsageStatus();
        checks.api = true;
        console.log(chalk.green("✓ API connection: ") + chalk.gray("OK"));
      } catch (error) {
        console.log(chalk.red("✗ API connection: ") + chalk.gray(error.message));
      }
    }

    // Summary
    console.log("\n" + chalk.bold("Health Check Result:"));
    const allPassed = Object.values(checks).every((v) => v);
    if (allPassed) {
      console.log(chalk.green("✓ All checks passed, configuration is OK!"));
    } else {
      console.log(chalk.yellow("⚠ Issues found, please check the errors above"));
    }
  });

// Status command (Show current usage status)
program
  .command("status")
  .description("Show current usage status")
  .option("-c, --compact", "Compact display mode")
  .option("-w, --watch", "Real-time monitoring mode")
  .action(async (options) => {
    const spinner = ora("Fetching usage status...").start();

    try {
      const [apiData, subscriptionData] = await Promise.all([
        api.getUsageStatus(),
        api.getSubscriptionDetails(),
      ]);
      const usageData = api.parseUsageData(apiData, subscriptionData);

      // Get billing data for usage statistics
      let usageStats = null;
      try {
        // Monthly statistics
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime();
        const billingRecords = await api.getAllBillingRecords(100, monthStart);
        if (billingRecords.length > 0) {
          usageStats = api.calculateUsageStats(billingRecords, monthStart, now.getTime());
        }
      } catch (billingError) {
        console.error(chalk.gray(`Failed to fetch usage stats: ${billingError.message}`));
      }

      const statusBar = new StatusBar(usageData, usageStats, api);
      const allModels = api.parseAllModels(apiData);

      spinner.succeed("Status fetched successfully");

      if (options.compact) {
        console.log(statusBar.renderCompact());
      } else {
        const statusBarWithModels = new StatusBar(usageData, usageStats, api, allModels);
        console.log("\n" + statusBarWithModels.render() + "\n");
      }

      if (options.watch) {
        console.log(chalk.gray("Monitoring... Press Ctrl+C to exit"));
        startWatching(api, statusBar);
      }
    } catch (error) {
      spinner.fail(chalk.red("Failed to fetch status"));
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// List command (Show all models usage status)
program
  .command("list")
  .description("Show all models usage status")
  .action(async () => {
    const spinner = ora("Fetching usage status...").start();

    try {
      const [apiData, subscriptionData] = await Promise.all([
        api.getUsageStatus(),
        api.getSubscriptionDetails(),
      ]);
      const usageData = api.parseUsageData(apiData, subscriptionData);
      const allModels = api.parseAllModels(apiData);

      spinner.succeed("Status fetched successfully");
      const statusBarWithModels = new StatusBar(usageData, null, null, allModels);
      console.log("\n" + statusBarWithModels.render() + "\n");
    } catch (error) {
      spinner.fail(chalk.red("Failed to fetch status"));
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// StatusBar command (Persistent display at terminal bottom)
program
  .command("bar")
  .description("Continuously display status bar at terminal bottom")
  .action(async () => {
    const TerminalStatusBar = require("./statusbar");
    const statusBar = new TerminalStatusBar();
    await statusBar.start();
  });

// Statusline command - Single output mode (Claude Code controls refresh)
program
  .command("statusline")
  .description("Claude Code status bar integration (read from stdin, single output)")
  .action(async () => {
    let stdinData = null;
    if (!process.stdin.isTTY) {
      // 使用 Promise.race 添加超时，避免 Claude Code 场景下挂起
      const readStdin = async () => {
        const chunks = [];
        for await (const chunk of process.stdin) {
          chunks.push(chunk);
        }
        return Buffer.concat(chunks).toString();
      };

      try {
        const stdinString = await Promise.race([
          readStdin(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('stdin timeout')), 1000))
        ]);

        if (stdinString.trim()) {
          try {
            stdinData = JSON.parse(stdinString);
          } catch (e) {
            // 静默忽略解析错误
          }
        }
      } catch (e) {
        // 超时或其他错误，静默继续
      }
    }

    const cliCurrentDir = process.cwd().split(/[/\\]/).pop();

    try {
      const [apiData, subscriptionData] = await Promise.all([
        api.getUsageStatus(),
        api.getSubscriptionDetails(),
      ]);
      const usageData = api.parseUsageData(apiData, subscriptionData);

      const { usage, modelName, remaining, expiry } = usageData;
      const percentage = usage.percentage;

      let displayModel = modelName;
      let currentDir = null;
      let modelId = null;
      let contextSize = getContextWindowSize(modelName) || getDefaultContextWindowSize();

      if (stdinData) {
        if (stdinData.model && stdinData.model.display_name) {
          displayModel = stdinData.model.display_name;
          modelId = stdinData.model.id;
        } else if (stdinData.model && stdinData.model.id) {
          displayModel = stdinData.model.id;
          modelId = stdinData.model.id;
        }

        if (stdinData.workspace && stdinData.workspace.current_directory) {
          currentDir = stdinData.workspace.current_directory.split("/").pop();
        }
      } else {
        modelId = modelName.toLowerCase().replace(/\s+/g, "-");
      }

      if (modelId) {
        // MiniMax 模型使用映射表获取 context window
        contextSize = getContextWindowSize(modelId) || getContextWindowSize(modelName) || getDefaultContextWindowSize();
      }

      let contextUsageTokens = null;
      if (stdinData && stdinData.transcript_path) {
        contextUsageTokens = await transcriptParser.findLatestUsage(stdinData.transcript_path);
      }

      const displayDir = currentDir || cliCurrentDir || "";

      let configCounts = { claudeMdCount: 0, rulesCount: 0, mcpCount: 0, hooksCount: 0 };
      // 优先使用 stdin 传入的 workspacePath，否则 fallback 到 process.cwd()
      const workspacePath = stdinData?.workspace?.current_directory || process.cwd();
      if (workspacePath) {
        try {
          // 添加超时防止挂起
          configCounts = await Promise.race([
            configCounter.count(workspacePath),
            new Promise((_, reject) => setTimeout(() => reject(new Error('config timeout')), 2000))
          ]);
        } catch (e) {
          // 超时或失败，保持默认值
        }
      }

      // 获取 git 分支信息
      // 优先使用 stdin 传入的 workspacePath，否则 fallback 到 process.cwd()
      const gitSearchPath = workspacePath || process.cwd();
      let gitBranch = null;
      if (gitSearchPath) {
        try {
          const branch = require('child_process').execSync(
            'git symbolic-ref --short HEAD',
            { cwd: gitSearchPath, encoding: 'utf8', timeout: 3000 }
          ).trim();
          if (branch) {
            gitBranch = { name: branch };

            // 获取 ahead/behind
            let hasUpstream = false;
            try {
              const revList = require('child_process').execSync(
                'git rev-list --left-right --count HEAD...@{upstream}',
                { cwd: gitSearchPath, encoding: 'utf8', timeout: 3000 }
              ).trim();
              if (revList) {
                hasUpstream = true;
                const [behind, ahead] = revList.split(/\s+/).map(n => parseInt(n) || 0);
                if (ahead > 0 || behind > 0) {
                  gitBranch.ahead = ahead;
                  gitBranch.behind = behind;
                }
              }
            } catch (e) {
              // 无 upstream 或获取失败，静默跳过
            }

            // 如果没有 upstream，尝试获取本地 commit 数作为提示
            if (!hasUpstream) {
              try {
                const localCommits = require('child_process').execSync(
                  'git rev-list --count HEAD',
                  { cwd: gitSearchPath, encoding: 'utf8', timeout: 3000 }
                ).trim();
                const commitCount = parseInt(localCommits) || 0;
                // 如果有本地 commits（大于1，因为初始commit算1个），标记有待推送
                if (commitCount > 1) {
                  gitBranch.ahead = -1; // -1 表示有未知数量的待推送
                }
              } catch (e) {
                // 获取失败，静默跳过
              }
            }

            // 检查未提交的更改
            try {
              const status = require('child_process').execSync(
                'git status --porcelain',
                { cwd: gitSearchPath, encoding: 'utf8', timeout: 3000 }
              ).trim();
              if (status) {
                gitBranch.hasChanges = true;
              }
            } catch (e) {
              // 获取失败，静默跳过
            }
          }
        } catch (e) {
          // 非 git 目录或获取失败，静默跳过
        }
      }

      // 优先使用 Claude Code 提供的实时 tokens_used，如果没有则回退到 transcript 解析
      let contextUsageValue = 0;
      let contextSizeValue = contextSize;

      if (stdinData?.context_window) {
        const cw = stdinData.context_window;
        contextSizeValue = cw.context_window_size || contextSize;
        // 关键点：优先取这里，这是最实时的
        contextUsageValue = cw.tokens_used || contextUsageTokens || 0;
      } else {
        contextUsageValue = contextUsageTokens || 0;
      }

      const context = {
        modelName: displayModel,
        currentDir: displayDir,
        usagePercentage: percentage,
        usage,
        remaining,
        expiry,
        weekly: usageData.weekly,
        contextUsage: contextUsageValue,
        contextSize: contextSizeValue,
        configCounts,
        gitBranch,
        tools: [],
        agents: [],
        todos: [],
      };

      if (stdinData && stdinData.transcript_path) {
        const transcript = await transcriptParser.parse(stdinData.transcript_path);
        context.tools = transcript.tools;
        context.agents = transcript.agents;
        context.todos = transcript.todos;
      }

      console.log(renderer.render(context));
    } catch (error) {
      console.log(`❌ MiniMax 错误: ${error.message}`);
    }
  });

// Droid-statusline command - Droid 状态栏集成（从 session 文件读取数据）
program
  .command("droid-statusline")
  .description("Droid状态栏集成（从 session 文件读取数据，单次输出）")
  .argument("[sessionPath]", "Droid session 目录路径（可选，默认自动查找）")
  .action(async (sessionPath) => {
    const fs = require("fs");
    const path = require("path");

    // 查找 session 目录
    let targetSessionPath = sessionPath;
    const currentCwd = process.cwd().replace(/\\/g, "/");
    
    if (!targetSessionPath) {
      const sessionsDir = path.join(process.env.HOME || process.env.USERPROFILE, ".factory", "sessions");
      
      if (!fs.existsSync(sessionsDir)) {
        console.log("❌ 未找到 Droid sessions 目录");
        process.exit(1);
      }

      // 优先查找与当前工作目录匹配的 session
      const userDirs = fs.readdirSync(sessionsDir);
      let matchedSession = null;
      let latestSession = null;
      let latestStartTime = 0;

      for (const userDir of userDirs) {
        const userPath = path.join(sessionsDir, userDir);
        if (!fs.statSync(userPath).isDirectory()) continue;

        const sessions = fs.readdirSync(userPath);
        for (const session of sessions) {
          if (!session.endsWith(".jsonl")) continue;
          
          const jsonlPath = path.join(userPath, session);
          try {
            const content = fs.readFileSync(jsonlPath, "utf8");
            const firstLine = content.split("\n")[0];
            const entry = JSON.parse(firstLine);
            
            if (entry.cwd) {
              const sessionCwd = entry.cwd.replace(/\\/g, "/");
              // 优先匹配当前工作目录
              if (sessionCwd === currentCwd || currentCwd.includes(sessionCwd) || sessionCwd.includes(currentCwd)) {
                if (!matchedSession) {
                  matchedSession = userPath;
                }
              }
            }
            
            // 记录最新 session
            if (entry.timestamp) {
              const startTime = new Date(entry.timestamp).getTime();
              if (startTime > latestStartTime) {
                latestStartTime = startTime;
                latestSession = userPath;
              }
            }
          } catch (e) {
            // continue
          }
        }
      }

      // 优先使用匹配的 session，否则用最新的
      targetSessionPath = matchedSession || latestSession;

      if (!targetSessionPath) {
        console.log("❌ 未找到 Droid session");
        process.exit(1);
      }
    }

    // 读取 settings.json
    const settingsFiles = fs.readdirSync(targetSessionPath).filter(f => f.endsWith(".settings.json"));
    let settings = {};
    
    for (const sf of settingsFiles) {
      try {
        const content = fs.readFileSync(path.join(targetSessionPath, sf), "utf8");
        const parsed = JSON.parse(content);
        if (parsed.tokenUsage) {
          settings = parsed;
          break;
        }
      } catch (e) {
        // continue
      }
    }

    // 读取 jsonl 获取 cwd 和模型信息，以及实时 token 使用量
    let cwd = process.cwd();
    let jsonlTokens = null;
    const jsonlFiles = fs.readdirSync(targetSessionPath).filter(f => f.endsWith(".jsonl"));
    
    for (const jf of jsonlFiles) {
      try {
        const content = fs.readFileSync(path.join(targetSessionPath, jf), "utf8");
        const lines = content.split('\n').filter(l => l.trim());
        
        // 获取第一行获取 cwd
        if (lines.length > 0) {
          try {
            const firstEntry = JSON.parse(lines[0]);
            if (firstEntry.cwd) {
              cwd = firstEntry.cwd;
            }
          } catch (e) {}
        }
        
        // 从最后的消息中解析实时 token 使用量
        for (let i = lines.length - 1; i >= 0; i--) {
          try {
            const entry = JSON.parse(lines[i]);
            // 查找 assistant 消息中的 usage
            if (entry.type === 'message' && entry.message?.role === 'assistant' && entry.message?.usage) {
              const u = entry.message.usage;
              jsonlTokens = {
                inputTokens: u.input_tokens || u.prompt_tokens || 0,
                outputTokens: u.output_tokens || u.completion_tokens || 0,
                cacheCreationTokens: u.cache_creation_input_tokens || u.cache_creation_prompt_tokens || 0,
                cacheReadTokens: u.cache_read_input_tokens || u.cache_read_prompt_tokens || 0,
                thinkingTokens: u.thinking_tokens || 0
              };
              break;
            }
          } catch (e) {
            continue;
          }
        }
      } catch (e) {
        // continue
      }
    }

    const currentDir = cwd.split(/[/\\]/).pop();

    // 优先使用 jsonl 中的实时 token 使用量，否则用 settings 中的累计值
    const tokenUsage = (jsonlTokens && (jsonlTokens.inputTokens > 0 || jsonlTokens.outputTokens > 0)) 
      ? jsonlTokens 
      : (settings.tokenUsage || {});
    
    const inputTokens = tokenUsage.inputTokens || 0;
    const outputTokens = tokenUsage.outputTokens || 0;
    const cacheCreationTokens = tokenUsage.cacheCreationTokens || 0;
    const cacheReadTokens = tokenUsage.cacheReadTokens || 0;
    const thinkingTokens = tokenUsage.thinkingTokens || 0;
    
    // 实时上下文使用量（不包括累计的 cacheReadTokens）
    const contextTokens = inputTokens + outputTokens + cacheCreationTokens + thinkingTokens;
    // 累计 token（用于显示）
    const totalTokens = inputTokens + outputTokens + cacheCreationTokens + cacheReadTokens + thinkingTokens;

    // 获取模型信息
    const modelName = settings.model || "MiniMax-M2.5-highspeed";
    const modelDisplayName = modelName.replace(/^custom:/, "").replace(/-[0-9]+$/, "");

    // 获取 API 使用量
    let usageData = null;
    try {
      const [apiData, subscriptionData] = await Promise.all([
        api.getUsageStatus(),
        api.getSubscriptionDetails(),
      ]);
      usageData = api.parseUsageData(apiData, subscriptionData);
    } catch (e) {
      usageData = {
        usage: { percentage: 0, input: 0, output: 0, cached: 0, total: 0 },
        weekly: null,
        remaining: "未知",
        expiry: "未知",
        modelName: modelDisplayName
      };
    }

    const { usage, weekly, remaining, expiry } = usageData;

    // 获取 git 分支
    let gitBranch = null;
    try {
      const branch = require('child_process').execSync(
        'git symbolic-ref --short HEAD',
        { cwd: cwd, encoding: 'utf8', timeout: 3000 }
      ).trim();
      if (branch) {
        gitBranch = { name: branch };
        
        // 检查未提交的更改
        try {
          const status = require('child_process').execSync(
            'git status --porcelain',
            { cwd: cwd, encoding: 'utf8', timeout: 3000 }
          ).trim();
          if (status) {
            gitBranch.hasChanges = true;
          }
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      // 非 git 目录
    }

    // 计算上下文使用量（从 session 实时 token）
    // 使用实时 contextTokens 计算百分比
    const contextUsageValue = contextTokens;
    const contextSizeValue = getContextWindowSize(modelName) || getDefaultContextWindowSize();

    // 获取 Droid 全局配置统计（不是当前工作目录）
    const droidConfigDir = path.join(process.env.HOME || process.env.USERPROFILE, ".factory");
    let configCounts = { claudeMdCount: 0, rulesCount: 0, mcpCount: 0, hooksCount: 0, skillsCount: 0 };
    
    try {
      const agentsPath = path.join(droidConfigDir, "agents");
      const rulesPath = path.join(droidConfigDir, "rules");
      const skillsPath = path.join(droidConfigDir, "skills");
      const hooksPath = path.join(droidConfigDir, "hooks");
      const mcpPath = path.join(droidConfigDir, "mcp.json");

      if (fs.existsSync(agentsPath)) {
        configCounts.claudeMdCount = fs.readdirSync(agentsPath).filter(f => f.endsWith(".md")).length;
      }
      if (fs.existsSync(rulesPath)) {
        configCounts.rulesCount = fs.readdirSync(rulesPath).filter(f => f.endsWith(".md")).length;
      }
      if (fs.existsSync(skillsPath)) {
        configCounts.skillsCount = fs.readdirSync(skillsPath).filter(f => f.endsWith(".md")).length;
      }
      if (fs.existsSync(hooksPath)) {
        configCounts.hooksCount = fs.readdirSync(hooksPath).filter(f => f.endsWith(".ps1") || f.endsWith(".sh")).length;
      }
      if (fs.existsSync(mcpPath)) {
        try {
          const mcpData = JSON.parse(fs.readFileSync(mcpPath, "utf8"));
          if (mcpData.mcpServers) {
            configCounts.mcpCount = Object.keys(mcpData.mcpServers).length;
          }
        } catch (e) {}
      }
    } catch (e) {
      // ignore errors
    }

    const blocks = [];

    // 高对比度徽章配色，纯 Powerline 渲染
    if (currentDir) {
      blocks.push({ text: ` ${currentDir} `, bg: '#1D4ED8' }); // 皇家蓝
    }
    
    const useNerdFonts = !process.env.MINIMAX_PLAIN_UI && !process.env.NO_NERD_FONTS;
    const arrow = useNerdFonts ? '\uE0B0' : '>';
    const branchIcon = useNerdFonts ? '\uE0A0' : '*';

    if (gitBranch && gitBranch.name) {
      let branchStr = gitBranch.name;
      if (branchStr.length > 20) branchStr = branchStr.substring(0, 10) + '…' + branchStr.substring(branchStr.length - 7);
      if (gitBranch.hasChanges) {
        branchStr += ' *';
      }
      blocks.push({ text: ` ${branchIcon} ${branchStr} `, bg: '#7E22CE' }); // 紫色回归
    }
    
    if (usage && usage.total > 0) {
      let bg = '#065F46'; // 回归稳健的深翠绿 (Emerald 800)
      if (usage.percentage >= 95) bg = '#991B1B'; // danger (Red 800)
      else if (usage.percentage >= 75) bg = '#9A3412'; // warn (Orange 800)

      let usageText = ` ${usage.percentage}%  (${usage.remaining}/${usage.total}) `;
      if (weekly) {
        if (weekly.unlimited) {
          usageText += `· W ∞ `;
        } else {
          usageText += `· W ${weekly.percentage}% `;
        }
      }
      blocks.push({ text: usageText, bg: bg });
    }
    
    if (remaining) {
      const remainingText = remaining.hours > 0 
        ? `${remaining.hours}h${remaining.minutes}m` 
        : `${remaining.minutes}m`;
      blocks.push({ text: ` ${remainingText} `, bg: '#92400E' });
    }
    
    if (expiry) {
      let bg = '#374151'; // Gray 700
      if (expiry.daysRemaining <= 7) bg = '#9A3412';
      if (expiry.daysRemaining <= 3) bg = '#991B1B';
      blocks.push({ text: ` 剩${expiry.daysRemaining}天 `, bg: bg });
    }

    let out = '';
    const leftArrow = useNerdFonts ? '\uE0B0' : '>';
    
    for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        
        // 磁贴开启：顺行式起点，利用黑色箭头实现内凹镂空感
        if (i === 0) {
            out += '\u001b[0m' + chalk.bgHex(b.bg).black(leftArrow);
        }
        
        // 磁贴文字内容
        out += '\u001b[0m' + chalk.bgHex(b.bg).bold.whiteBright(b.text);
        
        if (i < blocks.length - 1) {
            const nextB = blocks[i + 1];
            if (useNerdFonts) {
                // 衔接尖部
                out += '\u001b[0m' + chalk.bgHex(nextB.bg).hex(b.bg)(arrow);
            } else {
                out += '\u001b[0m' + chalk.bgHex(b.bg).bold.whiteBright(arrow);
            }
        } else {
            // 最后一块磁贴：顺行式终点
            out += '\u001b[0m' + chalk.hex(b.bg)(arrow);
        }
    }
    
    console.log(out);
  });

// 模型上下文窗口大小（仅MiniMax模型）

function startWatching(api, statusBar) {
  let intervalId;

  const update = async () => {
    try {
      const apiData = await api.getUsageStatus();
      const usageData = api.parseUsageData(apiData);
      const newStatusBar = new StatusBar(usageData);

      // 清除之前的输出
      process.stdout.write("\x1Bc");

      console.log("\n" + newStatusBar.render() + "\n");
      console.log(chalk.gray(`最后更新: ${new Date().toLocaleTimeString()}`));
    } catch (error) {
      console.error(chalk.red(`更新失败: ${error.message}`));
    }
  };

  // 初始更新
  update();

  // 每10秒更新一次，以近实时更新
  intervalId = setInterval(update, 10000);

  // 处理Ctrl+C
  process.on("SIGINT", () => {
    clearInterval(intervalId);
    console.log(chalk.yellow("\n监控已停止"));
    process.exit(0);
  });
}

// 如果没有命令提供帮助
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(1);
}

program.parse();
