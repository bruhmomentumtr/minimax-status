const chalk = require('chalk').default;
const dayjs = require('dayjs');
const { default: boxen } = require('boxen');
const { default: stringWidth } = require('string-width');

class StatusBar {
  constructor(data, usageStats = null, api = null, allModels = []) {
    this.data = data;
    this.usageStats = usageStats;
    this.api = api;
    this.allModels = allModels;
    this.totalWidth = 63;
    this.borderWidth = 4;
  }

  // Format number
  formatNumber(num) {
    if (this.api) {
      return this.api.formatNumber(num);
    }
    if (num >= 100000000) {
      return (num / 100000000).toFixed(1).replace(/\.0$/, "") + "亿";
    }
    if (num >= 10000) {
      return (num / 10000).toFixed(1).replace(/\.0$/, "") + "万";
    }
    return num.toLocaleString("zh-CN");
  }

  // Render consumption statistics
  renderConsumptionStats() {
    if (!this.usageStats) {
      return '';
    }

    const lines = [];
    lines.push('');
    lines.push(chalk.bold('📊 Token Usage Stats'));

    const leftWidth = 12;
    const rightWidth = 15;
    const padding = this.totalWidth - this.borderWidth - leftWidth - rightWidth;

    const pad = ' '.repeat(Math.max(0, padding));

    const formatLine = (label, value) => {
      return `│ ${chalk.cyan(label)}${pad}${this.formatNumber(value)}`;
    };

    lines.push(formatLine('Yesterday: ', this.usageStats.lastDayUsage));
    lines.push(formatLine('Last 7 days: ', this.usageStats.weeklyUsage));
    lines.push(formatLine('This month: ', this.usageStats.planTotalUsage));

    return lines.join('\n');
  }

  // Render all models quota section
  renderAllModelsSection() {
    if (!this.allModels || this.allModels.length === 0) {
      return '';
    }

    const lines = [];
    lines.push('');
    lines.push(chalk.bold('📋 All Models Quota'));

    // 简化模型名称映射
    const shortName = (name) => {
      if (name.includes('MiniMax-M')) return 'MiniMax-M*';
      if (name.includes('speech')) return 'speech-hd';
      if (name.includes('Hailuo-2.3-Fast')) return 'Hailuo';
      if (name.includes('Hailuo-2.3')) return 'Hailuo-2.3';
      if (name.includes('Hailuo')) return 'Hailuo';
      if (name.includes('music')) return 'music';
      if (name.includes('image')) return 'image';
      return name.length > 15 ? name.substring(0, 12) + '...' : name;
    };

    // 获取状态颜色
    const getStatusColor = (percentage) => {
      if (percentage >= 85) return chalk.hex('#EF4444');
      if (percentage >= 60) return chalk.hex('#F59E0B');
      return chalk.hex('#10B981');
    };

    // 显示状态
    const getStatusText = (percentage) => {
      if (percentage >= 85) return '⛔';
      if (percentage >= 60) return '⚡';
      return '✓';
    };

    // 每行显示一个模型
    for (const model of this.allModels) {
      const short = shortName(model.name);
      const color = getStatusColor(model.percentage);
      const status = getStatusText(model.percentage);
      const pct = `${model.percentage}%`;
      const usedTotal = `${model.used}/${model.total}`;

      lines.push(`  ${color(short.padEnd(15))} ${color(pct.padEnd(5))} ${color(usedTotal.padEnd(12))} ${color(status)}`);
    }

    return lines.join('\n');
  }

  // 辅助函数：填充内容到正确长度，处理 chalk 代码和中文字符
  padLine(leftContent, rightContent) {
    // 移除 chalk 代码以便计算
    const leftClean = leftContent.replace(/\x1b\[[0-9;]*m/g, '');
    const rightClean = rightContent.replace(/\x1b\[[0-9;]*m/g, '');

    // 计算视觉宽度（中文字符 = 2，英文字符 = 1）
    const leftLength = stringWidth(leftClean);
    const rightLength = stringWidth(rightClean);

    // 总宽度应为 63，边框为 3，所以内容区域为 60
    const contentAreaWidth = this.totalWidth - this.borderWidth; // 60
    const totalContentLength = leftLength + rightLength;
    const paddingNeeded = Math.max(0, contentAreaWidth - totalContentLength);
    const padding = ' '.repeat(paddingNeeded);

    return `│ ${leftContent}${padding}${rightContent}`;
  }

  render() {
    const { modelName, timeWindow, remaining, usage, weekly, expiry } = this.data;

    // Calculate progress bar width
    const width = 30;
    const filled = Math.floor((usage.percentage / 100) * width);
    const empty = width - filled;

    // Create progress bar with colors based on usage percentage
    const progressBar = this.createProgressBar(filled, empty, usage.percentage);

    // Build content lines
    const contentLines = [];

    // Title
    contentLines.push(chalk.bold('MiniMax Claude Code Usage Status'));

    contentLines.push('');

    // Model name
    contentLines.push(`${chalk.cyan('Current Model:')} ${modelName}`);

    // Time window
    const timeWindowText = `${timeWindow.start}-${timeWindow.end}(${timeWindow.timezone})`;
    contentLines.push(`${chalk.cyan('Time Window:')} ${timeWindowText}`);

    // Remaining time
    contentLines.push(`${chalk.cyan('Remaining:')} ${remaining.text}`);

    contentLines.push('');

    // Usage percentage with progress bar
    contentLines.push(`${chalk.cyan('Used Quota:')} ${progressBar} ${usage.percentage}%`);

    // Remaining calls
    contentLines.push(`${chalk.dim('          Remaining:')} ${usage.remaining}/${usage.total} calls`);

    // Weekly usage (if data available)
    if (weekly) {
      contentLines.push('');
      if (weekly.unlimited) {
        contentLines.push(`${chalk.cyan('Weekly Limit:')} ${chalk.hex('#10B981')('Unlimited')}`);
      } else {
        const weeklyPercent = weekly.percentage;
        const weeklyColor = weeklyPercent >= 85 ? chalk.hex('#EF4444') : weeklyPercent >= 60 ? chalk.hex('#F59E0B') : chalk.hex('#10B981');
        const weeklyProgress = this.createProgressBar(
          Math.floor((weeklyPercent / 100) * 15),
          15 - Math.floor((weeklyPercent / 100) * 15),
          weeklyPercent
        );
        contentLines.push(`${chalk.cyan('Weekly Limit:')} ${weeklyColor(weeklyProgress)} ${weeklyColor(weekly.percentage + '%')} (${weekly.used}/${weekly.total})`);
        contentLines.push(`${chalk.dim('          Reset:')} ${weekly.text}`);
      }
    }

    // Add expiry line (if available)
    if (expiry) {
      const expiryText = `${expiry.date} (${expiry.text})`;
      contentLines.push(`${chalk.cyan('Plan Expiry:')} ${expiryText}`);
    }

    // Add consumption stats (if data available)
    if (this.usageStats) {
      contentLines.push(this.renderConsumptionStats());
    }

    // Add all models quota (if data available)
    if (this.allModels && this.allModels.length > 0) {
      contentLines.push(this.renderAllModelsSection());
    }

    contentLines.push('');

    // 状态行
    const status = this.getStatus(usage.percentage);
    const statusColor = this.getStatusColor(status);
    contentLines.push(`${chalk.cyan('Status:')} ${statusColor}`);

    // Use boxen to create perfectly aligned border
    const boxenOptions = {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderColor: 'blue',
      borderStyle: 'single',
      dimBorder: true
    };

    return boxen(contentLines.join('\n'), boxenOptions);
  }

  createProgressBar(filled, empty, percentage) {
    const usedBar = '█'.repeat(filled);
    const remainingBar = '░'.repeat(empty);
    const bar = `${usedBar}${remainingBar}`;

    // Progress bar color based on usage percentage
    if (percentage >= 85) {
      return chalk.hex('#EF4444')(bar);
    } else if (percentage >= 60) {
      return chalk.hex('#F59E0B')(bar);
    } else {
      return chalk.hex('#10B981')(bar);
    }
  }

  getStatusLine(percentage) {
    const status = this.getStatus(percentage);
    const leftContent = `${chalk.cyan('Status:')} ${this.getStatusColor(status)}`;
    const rightContent = ' │';

    return this.padLine(leftContent, rightContent);
  }

  getStatusColor(status) {
    if (status === '⚡ Warning') {
      return chalk.hex('#F59E0B')(status);
    } else if (status === '⛔ Running Out') {
      return chalk.hex('#EF4444')(status);
    } else {
      return chalk.hex('#10B981')(status);
    }
  }

  getStatus(percentage) {
    if (percentage >= 85) {
      return '⛔ Running Out';
    } else if (percentage >= 60) {
      return '⚡ Warning';
    } else {
      return '✓ Normal';
    }
  }

  renderCompact() {
    const { usage, remaining, modelName, expiry } = this.data;
    const status = this.getStatus(usage.percentage);

    let color;
    if (usage.percentage >= 85) {
      color = chalk.hex('#EF4444');
    } else if (usage.percentage >= 60) {
      color = chalk.hex('#F59E0B');
    } else {
      color = chalk.hex('#10B981');
    }

    // Add expiry info (if available)
    const expiryInfo = expiry ? ` ${chalk.gray('•')} Remaining: ${expiry.daysRemaining} days` : '';

    return `${color('●')} ${modelName} ${usage.percentage}% ${chalk.dim(`(${usage.remaining}/${usage.total})`)} ${chalk.gray('•')} ${remaining.text} ${chalk.gray('•')} ${status}${expiryInfo}`;
  }

  // Render all models quota
  static renderAllModels(models) {
    if (!models || models.length === 0) {
      return '';
    }

    const lines = [];
    lines.push('');
    lines.push(chalk.bold('📋 All Models Quota'));

    // Header
    lines.push(chalk.gray('─'.repeat(55)));
    lines.push(`│ ${chalk.cyan('Model').padEnd(30)} ${chalk.cyan('Used/Total').padEnd(15)} ${chalk.cyan('Status')}`);
    lines.push(chalk.gray('─'.repeat(55)));

    for (const model of models) {
      let color;
      if (model.percentage >= 85) {
        color = chalk.hex('#EF4444');
      } else if (model.percentage >= 60) {
        color = chalk.hex('#F59E0B');
      } else {
        color = chalk.hex('#10B981');
      }

      const status = model.percentage >= 85 ? '⛔ Running Out' : model.percentage >= 60 ? '⚡ Warning' : '✓ Normal';
      const name = model.name.length > 28 ? model.name.substring(0, 25) + '...' : model.name;

      lines.push(`│ ${name.padEnd(30)} ${color(`${model.used}/${model.total} (${model.percentage}%)`).padEnd(15)} ${color(status)}`);
    }

    lines.push(chalk.gray('─'.repeat(55)));
    return lines.join('\n');
  }
}

module.exports = StatusBar;
