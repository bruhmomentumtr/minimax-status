const vscode = require("vscode");
const MinimaxAPI = require("./api");

// ── i18n: all hardcoded strings in one place ──────────────────────────────
const i18n = {
  "tr-TR": {
    // Tree view
    tokenUsageStats: "Token Kullanım İstatistikleri",
    yesterday: "Dün",
    last7Days: "Son 7 Gün",
    thisMonth: "Bu Ay",
    settings: "Ayarlar",
    help: "Yardım",
    openSettings: "Ayarları Aç",
    viewHelp: "Yardımı Görüntüle",
    // Status bar
    needsConfiguration: "MiniMax: Yapılandırma Gerekli",
    clickToConfigure: "MiniMax Durumu yapılandırmak için tıklayın",
    loading: "⏳ MiniMax: Yükleniyor...",
    fetchingStatus: "MiniMax Durum\nDurum alınıyor...",
    // Welcome message
    welcomeTitle: "MiniMax Durum'a Hoşgeldiniz!",
    welcomeMessage: "Başlamak için erişim tokenınızı yapılandırın.",
    configureNow: "Şimdi Yapılandır",
    later: "Sonra",
    // Activation error
    activationFailed: "MiniMax Durum eklentisi etkinleştirilemedi",
    // Help page
    helpTitle: "MiniMax Durum Yardım",
    step1Title: "Adım 1: API Anahtarı Al",
    step1Content: "platform.minimax.io -> Abonelik -> Token-Plan\n\n'Yeni API Anahtarı Oluştur' butonuna tıklayın",
    step2Title: "Adım 2: Eklentiyi Yapılandır",
    step2Content: "1. Yan panelde MiniMax simgesine tıklayın\n2. Ayarlar'a tıklayın\n3. API Anahtarını girin\n4. Kaydet'e tıklayın",
    step4Title: "Kullanım",
    step4Content: "• Durum çubuğu kullanım ilerlemesini gösterir\n• Yenilemek için durum çubuğuna tıklayın",
    // Settings page
    settingsTitle: "MiniMax Durum Ayarları",
    apiKey: "API Anahtarı",
    apiKeyPlaceholder: "MiniMax API Anahtarınızı girin",
    apiKeyInfo: "API anahtarınızı platform.minimax.io adresinden alın",
    displayTitle: "Görüntü Ayarları",
    refreshInterval: "Yenileme Aralığı (saniye)",
    refreshIntervalInfo: "Otomatik yenileme aralığı (10-300 saniye)",
    modelSelect: "Model",
    showTooltip: "Detaylı ipucu göster",
    save: "Kaydet",
    cancel: "İptal",
    apiKeyError: "Lütfen API Anahtarını girin",
    invalidInterval: "Yenileme aralığı 5-300 saniye arasında olmalıdır",
    modelAuto: "İlk modeli otomatik seç",
    modelEmpty: "Lütfen önce API Anahtarını yapılandırın",
    language: "Dil",
    languageInfo: "Eklenti dilini seçin",
    settingsSaved: "Ayarlar kaydedildi!",
    // Status bar i18n
    domestic: "Yurtiçi",
    overseas: "Yurtdışı",
    model: "Model",
    usageProgress: "Kullanım",
    remainingTime: "Kalan",
    timeWindow: "Zaman Penceresi",
    weeklyUsage: "Haftalık",
    weeklyReset: "Haftalık Sıfırlama",
    billingStats: "=== Token Kullanım İstatistikleri ===",
    expiry: "Bitiş",
    apiQuota: "API Kotası",
    reset: "Sıfırla",
    used: "Kullanılan",
    unlimited: "Sınırsız",
    refresh: "Yenile",
    // Tooltip
    period: "Dönem",
    quotaPanel: "MINIMAX · Kota Paneli",
    colModel: "Model",
    colUsage: "Kullanım",
    colPct: "%",
    colWeek: "Haftalık",
    colReset: "Sıfırla",
    groupCore: "Çekirdek",
    groupCodingPlan: "Kodlama Planı",
    groupMedia: "Medya",
    groupOther: "Diğer",
    tokens: "jeton",
    updated: "Güncellendi",
  },
  "en-US": {
    // Tree view
    tokenUsageStats: "Token Usage Stats",
    yesterday: "Yesterday",
    last7Days: "Last 7 days",
    thisMonth: "This month",
    settings: "Settings",
    help: "Help",
    openSettings: "Open Settings",
    viewHelp: "View Help",
    // Status bar
    needsConfiguration: "MiniMax: Needs Configuration",
    clickToConfigure: "MiniMax Status requires Token configuration\nClick to configure now",
    loading: "⏳ MiniMax: Loading...",
    fetchingStatus: "MiniMax Status\nFetching status...",
    // Welcome message
    welcomeTitle: "Welcome to MiniMax Status!",
    welcomeMessage: "Please configure your access token to get started.",
    configureNow: "Configure Now",
    later: "Later",
    // Activation error
    activationFailed: "MiniMax Status extension activation failed",
    // Help page
    helpTitle: "MiniMax Status Help",
    step1Title: "Step 1: Get API Key",
    step1Content: "Go to platform.minimax.io -> Subscription -> Token-Plan\n\nClick 'Create new API Key'",
    step2Title: "Step 2: Configure Plugin",
    step2Content: "1. Click MiniMax icon in sidebar\n2. Click Settings\n3. Enter API Key\n4. Click Save",
    step4Title: "Usage",
    step4Content: "• Status bar shows usage progress\n• Click status bar to refresh",
    // Settings page
    settingsTitle: "MiniMax Status Settings",
    apiKey: "API Key",
    apiKeyPlaceholder: "Enter your MiniMax API Key",
    apiKeyInfo: "Get your API key from platform.minimax.io",
    displayTitle: "Display Settings",
    refreshInterval: "Refresh Interval (seconds)",
    refreshIntervalInfo: "Auto-refresh interval (10-300 seconds)",
    modelSelect: "Model",
    showTooltip: "Show detailed tooltip",
    save: "Save",
    cancel: "Cancel",
    apiKeyError: "Please enter API Key",
    invalidInterval: "Refresh interval must be between 5-300 seconds",
    modelAuto: "Auto select first model",
    modelEmpty: "Please configure API Key first",
    language: "Language",
    languageInfo: "Select extension language",
    settingsSaved: "Settings saved!",
    // Status bar i18n
    domestic: "Domestic",
    overseas: "Overseas",
    model: "Model",
    usageProgress: "Usage",
    remainingTime: "Remaining",
    timeWindow: "Time Window",
    weeklyUsage: "Weekly",
    weeklyReset: "Weekly Reset",
    billingStats: "=== Token Usage Stats ===",
    expiry: "Expiry",
    apiQuota: "API QUOTA",
    reset: "Reset",
    used: "Used",
    unlimited: "Unlimited",
    refresh: "Refresh",
    // Tooltip
    period: "Period",
    quotaPanel: "MINIMAX · Quota Panel",
    colModel: "Model",
    colUsage: "Usage",
    colPct: "%",
    colWeek: "Weekly",
    colReset: "Reset",
    groupCore: "Core",
    groupCodingPlan: "Coding Plan",
    groupMedia: "Media",
    groupOther: "Other",
    tokens: "tokens",
    updated: "Updated",
  },
};

// Current language (default to en-US)
let currentLanguage = "en-US";

// Helper to get translation
function t(key) {
  return i18n[currentLanguage]?.[key] || i18n["en-US"]?.[key] || key;
}

// TreeView data provider for sidebar
class MinimaxStatusTreeProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.usageData = null;
    this.usageStats = null;
    this.language = "en-US";
  }

  setData(usageData, usageStats) {
    this.usageData = usageData;
    this.usageStats = usageStats;
    this.refresh();
  }


  getTreeItem(element) {
    return element;
  }

  getChildren(element) {
    // If element is provided, return its children (for nested items)
    if (element && element.children) {
      return element.children;
    }

    const items = [];

// Token Usage Statistics (collapsible group)
      if (this.usageStats && (this.usageStats.lastDayUsage > 0 || this.usageStats.weeklyUsage > 0 || this.usageStats.planTotalUsage > 0)) {
        const statsHeader = new vscode.TreeItem(
          t("tokenUsageStats"),
          vscode.TreeItemCollapsibleState.Expanded
        );
        statsHeader.iconPath = new vscode.ThemeIcon("graph");
        statsHeader.children = [];

        // Yesterday usage
        const yesterday = new vscode.TreeItem(
          `${t("yesterday")}: ${this.formatNum(this.usageStats.lastDayUsage)}`,
          vscode.TreeItemCollapsibleState.None
        );
        yesterday.iconPath = new vscode.ThemeIcon("calendar");
        statsHeader.children.push(yesterday);

        // Last 7 days usage
        const weekly = new vscode.TreeItem(
          `${t("last7Days")}: ${this.formatNum(this.usageStats.weeklyUsage)}`,
          vscode.TreeItemCollapsibleState.None
        );
        weekly.iconPath = new vscode.ThemeIcon("calendar");
        statsHeader.children.push(weekly);

        // This month usage
        const monthly = new vscode.TreeItem(
          `${t("thisMonth")}: ${this.formatNum(this.usageStats.planTotalUsage)}`,
          vscode.TreeItemCollapsibleState.None
        );
        monthly.iconPath = new vscode.ThemeIcon("calendar");
        statsHeader.children.push(monthly);

        items.push(statsHeader);
      }

      // Extension Settings
      const settingsItem = new vscode.TreeItem(
        t("settings"),
        vscode.TreeItemCollapsibleState.None
      );
      settingsItem.command = {
        command: "minimaxStatus.setup",
        title: t("openSettings")
      };
      settingsItem.iconPath = new vscode.ThemeIcon("settings");
      items.push(settingsItem);

      // Help & Tutorial
      const helpItem = new vscode.TreeItem(
        t("help"),
        vscode.TreeItemCollapsibleState.None
      );
      helpItem.command = {
        command: "minimaxStatus.showHelp",
        title: t("viewHelp")
      };
      helpItem.iconPath = new vscode.ThemeIcon("question");
      items.push(helpItem);

    return items;
  }

  formatNum(num) {
    if (num >= 100000000) {
      return (num / 100000000).toFixed(1).replace(/\.0$/, "") + "00M";
    }
    if (num >= 10000) {
      return (num / 10000).toFixed(1).replace(/\.0$/, "") + "0K";
    }
    return num.toLocaleString();
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }
}

// Activate function - entry point for the extension
function activate(context) {
  try {
    const api = new MinimaxAPI(context);

    // Create TreeView for sidebar
    const treeProvider = new MinimaxStatusTreeProvider();
    const treeView = vscode.window.createTreeView("minimaxStatusView", {
      treeDataProvider: treeProvider
    });

    // Update tree view when configuration changes
    const configChangeDisposableForTree = vscode.workspace.onDidChangeConfiguration(
      (e) => {
        if (e.affectsConfiguration("minimaxStatus")) {
          treeProvider.refresh();
        }
      }
    );

    const statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    statusBarItem.command = "minimaxStatus.refresh";
    statusBarItem.show();

    let intervalId;
    let billingCache = null;
    let billingCacheTime = 0;
    const BILLING_CACHE_DURATION = 30000; // 30 seconds cache for billing data

    const updateStatus = async () => {
      try {
        // Refresh API config to get latest settings
        api.refreshConfig();

        // Get usage data
        const [apiData, subscriptionData] = await Promise.all([
          api.getUsageStatus(),
          api.getSubscriptionDetails().catch(() => null)
        ]);
        const usageData = api.parseUsageData(apiData, subscriptionData);

        // Fetch billing data for usage statistics (with caching)
        const nowDate = new Date();
        const now = nowDate.getTime();
        // Calculate monthly usage from natural month
        const monthStart = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1, 0, 0, 0, 0).getTime();
        if (!billingCache || now - billingCacheTime > BILLING_CACHE_DURATION) {
          try {
            const billingRecords = await api.getAllBillingRecords(100, monthStart);
            billingCache = billingRecords;
            billingCacheTime = now;
          } catch (billingError) {
            console.error("Failed to fetch billing data:", billingError.message);
            billingCache = [];
          }
        }

        // Calculate usage statistics
        let usageStats = {
          lastDayUsage: 0,
          weeklyUsage: 0,
          planTotalUsage: 0,
        };

        if (billingCache && billingCache.length > 0) {
          usageStats = api.calculateUsageStats(billingCache, monthStart, now);
        }

        updateStatusBar(statusBarItem, api, usageData, apiData, usageStats);
        treeProvider.setData(usageData, usageStats);
      } catch (error) {
        console.error("Failed to fetch status:", error.message);
        statusBarItem.text = "$(warning) MiniMax";
        statusBarItem.tooltip = `Error: ${error.message}\nClick to configure`;
        statusBarItem.color = new vscode.ThemeColor("errorForeground");
      }
    };

    const config = vscode.workspace.getConfiguration("minimaxStatus");
    const interval = config.get("refreshInterval", 30) * 1000;

    // Initial update
    updateStatus();

    // Set up interval
    intervalId = setInterval(updateStatus, interval);

    // Subscribe to configuration changes
    const configChangeDisposable = vscode.workspace.onDidChangeConfiguration(
      (e) => {
        if (e.affectsConfiguration("minimaxStatus")) {
          api.refreshConfig();
          const newInterval = config.get("refreshInterval", 30) * 1000;
          clearInterval(intervalId);
          intervalId = setInterval(updateStatus, newInterval);
          updateStatus();
        }
      }
    );

    // Subscribe to refresh command
    const refreshDisposable = vscode.commands.registerCommand(
      "minimaxStatus.refresh",
      updateStatus
    );

    // Subscribe to setup command
    const setupDisposable = vscode.commands.registerCommand(
      "minimaxStatus.setup",
      async () => {
        const panel = await showSettingsWebView(context, api, updateStatus);
        context.subscriptions.push(panel);
      }
    );

    // Subscribe to help command
    const helpDisposable = vscode.commands.registerCommand(
      "minimaxStatus.showHelp",
      async () => {
        const panel = await showHelpWebView(context);
        context.subscriptions.push(panel);
      }
    );

    // Add to subscriptions
    context.subscriptions.push(
      statusBarItem,
      configChangeDisposable,
      configChangeDisposableForTree,
      refreshDisposable,
      setupDisposable,
      helpDisposable,
      treeView
    );

    // Always show status bar item
    if (!api.token) {
      statusBarItem.text = t("needsConfiguration");
      statusBarItem.color = new vscode.ThemeColor("warningForeground");
      statusBarItem.tooltip = t("clickToConfigure");
      statusBarItem.command = "minimaxStatus.setup";

      setTimeout(() => {
        vscode.window
          .showInformationMessage(
            `${t("welcomeTitle")}\n\n${t("welcomeMessage")}`,
            t("configureNow"),
            t("later")
          )
          .then((selection) => {
            if (selection === t("configureNow")) {
              vscode.commands.executeCommand("minimaxStatus.setup");
            }
          });
      }, 2000);
    } else {
      // If configured but no data yet, show waiting message
      statusBarItem.text = t("loading");
      statusBarItem.color = new vscode.ThemeColor("statusBar.foreground");
      statusBarItem.tooltip = t("fetchingStatus");
      statusBarItem.command = "minimaxStatus.refresh";
    }
  } catch (error) {
    console.error("MiniMax Status extension activation failed:", error.message);
    vscode.window.showErrorMessage(
      `${t("activationFailed")}: ${error.message}`
    );
  }
}

// Create help webview
// eslint-disable-next-line no-unused-vars
async function showHelpWebView(context) {
  const panel = vscode.window.createWebviewPanel(
    "minimaxHelp",
    "MiniMax Status Help",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  const tHelp = {
    title: t("helpTitle"),
    step1Title: t("step1Title"),
    step1Content: t("step1Content"),
    step2Title: t("step2Title"),
    step2Content: t("step2Content"),
    step4Title: t("step4Title"),
    step4Content: t("step4Content"),
  };

  panel.webview.html = `
    <!DOCTYPE html>
    <html lang="${currentLanguage}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${tHelp.title}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 20px;
                padding: 0;
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
            }
            h1 {
                color: var(--vscode-editor-foreground);
                border-bottom: 2px solid var(--vscode-panel-border);
                padding-bottom: 10px;
                margin-bottom: 24px;
            }
            .step {
                background: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 8px;
                padding: 16px;
                margin-bottom: 16px;
            }
            .step h2 {
                font-size: 16px;
                font-weight: 600;
                margin: 0 0 12px 0;
                color: var(--vscode-editor-foreground);
            }
            .step p {
                margin: 0;
                color: var(--vscode-foreground);
                line-height: 1.6;
                white-space: pre-line;
            }
            code {
                background: var(--vscode-editor-wordHighlightBackground);
                padding: 2px 6px;
                border-radius: 4px;
                font-family: monospace;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>${tHelp.title}</h1>

            <div class="step">
                <h2>${tHelp.step1Title}</h2>
                <p>${tHelp.step1Content}</p>
            </div>

            <div class="step">
                <h2>${tHelp.step2Title}</h2>
                <p>${tHelp.step2Content}</p>
            </div>

            <div class="step">
                <h2>${tHelp.step4Title}</h2>
                <p>${tHelp.step4Content}</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return panel;
}

// Create settings webview
async function showSettingsWebView(context, api, updateStatus) {
  const panel = vscode.window.createWebviewPanel(
    "minimaxSettings",
    "MiniMax Status Settings",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  // Get current language
  const configLang = vscode.workspace.getConfiguration("minimaxStatus");
  currentLanguage = configLang.get("language") || "en-US";

  // Get current configuration
  const config = vscode.workspace.getConfiguration("minimaxStatus");
  const currentToken = config.get("token") || "";
  const currentInterval = config.get("refreshInterval") || 30;
  const currentShowTooltip = config.get("showTooltip") ?? true;
  const currentModelName = config.get("modelName") || "";

  // Labels from i18n
  const tSettings = {
    title: t("settingsTitle"),
    apiKey: t("apiKey"),
    apiKeyPlaceholder: t("apiKeyPlaceholder"),
    apiKeyInfo: t("apiKeyInfo"),
    displayTitle: t("displayTitle"),
    refreshInterval: t("refreshInterval"),
    refreshIntervalInfo: t("refreshIntervalInfo"),
    modelSelect: t("modelSelect"),
    showTooltip: t("showTooltip"),
    save: t("save"),
    cancel: t("cancel"),
    apiKeyError: t("apiKeyError"),
    invalidInterval: t("invalidInterval"),
    modelAuto: t("modelAuto"),
    modelEmpty: t("modelEmpty"),
    language: t("language"),
    languageInfo: t("languageInfo"),
  };

  // Language options
  const langOptions = `
    <option value="en-US" ${currentLanguage === 'en-US' ? 'selected' : ''}>English</option>
    <option value="tr-TR" ${currentLanguage === 'tr-TR' ? 'selected' : ''}>Türkçe</option>
  `;

  // Model labels from i18n
  const modelLabels = {
    modelAuto: t("modelAuto"),
    modelEmpty: t("modelEmpty"),
  };

  // Fetch available models if token is configured
  let availableModels = [];
  if (currentToken) {
    try {
      const statusData = await api.getUsageStatus();
      const parsedData = api.parseUsageData(statusData, null);
      availableModels = parsedData.allModels || [];
    } catch (error) {
      // Silently fail, model selector will show default option
    }
  }

  // Create model options
  const modelOptions = availableModels.length > 0
    ? `<option value="">${modelLabels.modelAuto}</option>` +
      availableModels.map(m => `<option value="${m}" ${m === currentModelName ? 'selected' : ''}>${m}</option>`).join('')
    : `<option value="">${modelLabels.modelEmpty}</option>`;

  // Create HTML content
  panel.webview.html = `
    <!DOCTYPE html>
    <html lang="${currentLanguage}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${tSettings.title}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 20px;
                padding: 0;
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
            }
            h1 {
                color: var(--vscode-editor-foreground);
                border-bottom: 2px solid var(--vscode-panel-border);
                padding-bottom: 10px;
                margin-bottom: 24px;
            }
            .card {
                background: var(--vscode-editor-background);
                border: 1px solid var(--vscode-panel-border);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 24px;
                box-shadow: 0 2px 12px rgba(0,0,0,0.15);
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            }
            .card h2 {
                font-size: 14px;
                font-weight: 600;
                margin: 0 0 16px 0;
                color: var(--vscode-editorForeground);
                border-bottom: 1px solid var(--vscode-panel-border);
                padding-bottom: 8px;
            }
            .form-group {
                margin-bottom: 16px;
            }
            .form-group:last-child {
                margin-bottom: 0;
            }
            label {
                display: block;
                margin-bottom: 6px;
                font-weight: 600;
                color: var(--vscode-editor-foreground);
                font-size: 13px;
            }
            input[type="text"],
            input[type="number"],
            select {
                padding: 12px 16px;
                border: 1px solid var(--vscode-input-border);
                border-radius: 6px;
                background: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                font-size: 14px;
                width: 100%;
                box-sizing: border-box;
            }
            input[type="number"] {
                width: 120px;
            }
            .checkbox-group {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .checkbox-group label {
                margin-bottom: 0;
                font-weight: 400;
            }
            .error {
                color: var(--vscode-errorForeground);
                font-size: 12px;
                margin-top: 4px;
            }
            .info-text {
                font-size: 12px;
                color: var(--vscode-descriptionForeground);
                margin-top: 4px;
            }
            .button-group {
                display: flex;
                gap: 12px;
                margin-top: 8px;
            }
            button {
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: background-color 0.2s;
            }
            button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            button.secondary {
                background-color: transparent;
                border: 1px solid var(--vscode-button-secondaryBackground);
            }
            button.secondary:hover {
                background-color: var(--vscode-button-secondaryHoverBackground);
            }
            select {
                appearance: none;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23c5c5c5' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 12px center;
                padding-right: 36px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>${tSettings.title}</h1>

            <!-- API Key -->
            <div class="card">
                <h2>${tSettings.apiKey}</h2>
                <div class="form-group">
                    <label for="token">${tSettings.apiKey}</label>
                    <input type="text" id="token" placeholder="${tSettings.apiKeyPlaceholder}" value="${currentToken}">
                    <div class="info-text">${tSettings.apiKeyInfo}</div>
                    <div class="error" id="token-error"></div>
                </div>
            </div>

            <!-- Display Settings -->
            <div class="card">
                <h2>${tSettings.displayTitle}</h2>
                <div class="form-group">
                    <label for="interval">${tSettings.refreshInterval}</label>
                    <input type="number" id="interval" min="5" max="300" value="${currentInterval}">
                    <div class="info-text">${tSettings.refreshIntervalInfo}</div>
                </div>
                <div class="form-group">
                    <label for="modelName">${tSettings.modelSelect}</label>
                    <select id="modelName">
                        ${modelOptions}
                    </select>
                </div>
                <div class="form-group">
                    <div class="checkbox-group">
                        <input type="checkbox" id="showTooltip" ${
                          currentShowTooltip ? "checked" : ""
                        }>
                        <label for="showTooltip">${tSettings.showTooltip}</label>
                    </div>
                </div>
                <div class="form-group">
                    <label for="language">${tSettings.language}</label>
                    <select id="language">
                        ${langOptions}
                    </select>
                    <div class="info-text">${tSettings.languageInfo}</div>
                </div>
            </div>

            <div class="button-group">
                <button id="saveBtn">${tSettings.save}</button>
                <button id="cancelBtn" class="secondary">${tSettings.cancel}</button>
            </div>
        </div>

        <script>
            const vscode = acquireVsCodeApi();

            document.getElementById('saveBtn').addEventListener('click', () => {
                const token = document.getElementById('token').value.trim();
                const interval = parseInt(document.getElementById('interval').value, 10);
                const showTooltip = document.getElementById('showTooltip').checked;
                const modelName = document.getElementById('modelName').value;
                const language = document.getElementById('language').value;

                // Clear previous errors
                document.getElementById('token-error').textContent = '';

                // Validate inputs
                if (!token) {
                    document.getElementById('token-error').textContent = tSettings.apiKeyError;
                    return;
                }

                if (interval < 5 || interval > 300) {
                    alert(tSettings.invalidInterval);
                    return;
                }

                // Save settings
                vscode.postMessage({
                    command: 'saveSettings',
                    token: token,
                    interval: interval,
                    showTooltip: showTooltip,
                    modelName: modelName,
                    language: language
                });
            });

            document.getElementById('cancelBtn').addEventListener('click', () => {
                vscode.postMessage({
                    command: 'cancelSettings'
                });
            });

            // Handle messages from extension
            window.addEventListener('message', event => {
                const message = event.data;
                if (message.command === 'closePanel') {
                    panel.dispose();
                }
            });
        </script>
    </body>
    </html>
    `;

  // Handle messages from webview
  panel.webview.onDidReceiveMessage(
    (message) => {
      switch (message.command) {
        case "saveSettings": {
          // Update VSCode settings
          const config = vscode.workspace.getConfiguration("minimaxStatus");

          config.update(
            "token",
            message.token,
            vscode.ConfigurationTarget.Global
          );
          config.update(
            "refreshInterval",
            message.interval,
            vscode.ConfigurationTarget.Global
          );
          config.update(
            "showTooltip",
            message.showTooltip,
            vscode.ConfigurationTarget.Global
          );
          if (message.modelName !== undefined) {
            config.update(
              "modelName",
              message.modelName,
              vscode.ConfigurationTarget.Global
            );
          }
          if (message.language !== undefined) {
            config.update(
              "language",
              message.language,
              vscode.ConfigurationTarget.Global
            );
            currentLanguage = message.language;
          }

          panel.dispose();

          // Refresh status
          updateStatus();

          vscode.window.showInformationMessage(t("settingsSaved"));
          break;
        }

        case "cancelSettings":
          panel.dispose();
          break;
      }
    },
    undefined,
    context.subscriptions
  );

  return panel;
}

// Helper function to generate progress bar (VSCode tooltip compatible)
// eslint-disable-next-line no-unused-vars
function _formatProgressBar(percentage, width = 20) {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return '[' + '\u2588'.repeat(filled) + '\u2591'.repeat(empty) + ']';
}

// Helper function to get progress color based on percentage
// eslint-disable-next-line no-unused-vars
function _getProgressColor(percentage) {
  if (percentage < 60) {
    return new vscode.ThemeColor("charts.green");
  } else if (percentage < 85) {
    return new vscode.ThemeColor("charts.yellow");
  } else {
    return new vscode.ThemeColor("errorForeground");
  }
}

// Helper to get model category color (for tooltip display)
// eslint-disable-next-line no-unused-vars
function _getModelBarColor(model) {
  if (model.isTextModel) {
    return '#4A90E2'; // Blue for text model
  } else if (model.name.includes('music')) {
    return '#FFA726'; // Orange for music model
  } else if (model.name.includes('speech')) {
    return '#9E9E9E'; // Gray for speech model
  }
  return '#4A90E2'; // Default blue
}

// eslint-disable-next-line no-unused-vars
function updateStatusBar(statusBarItem, api, data, apiData, usageStats) {
  // Helper to format number with units
  // eslint-disable-next-line no-unused-vars
  const _formatNumberI18n = (num) => {
    // English format uses K/M/B
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(2).replace(/\.0$/, "") + "B";
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(2).replace(/\.0$/, "") + "K";
    }
    return num.toLocaleString("en-US");
  };

  // Key fix: set status bar command to refresh
  statusBarItem.command = "minimaxStatus.refresh";

  // Use the main data
  const { usage, modelName, remaining, expiry, planTimeWindow } = data;

  // Set status bar text with color
  const percentage = usage.percentage;
  if (percentage < 60) {
    statusBarItem.color = new vscode.ThemeColor("charts.green");
  } else if (percentage < 85) {
    statusBarItem.color = new vscode.ThemeColor(
      "charts.yellow"
    );
  } else {
    statusBarItem.color = new vscode.ThemeColor("errorForeground");
  }

  // Build status bar text
  // Display format: remaining time percentage · weekly percentage
  const remainingText = remaining.hours > 0 ? `${remaining.hours}h` : `${remaining.minutes}m`;
  const weeklyLabel = 'W';
  let weeklyText = '';
  if (data.weekly) {
    if (data.weekly.unlimited) {
      weeklyText = ` · ${weeklyLabel} ♾️`;
    } else {
      weeklyText = ` · ${weeklyLabel} ${data.weekly.percentage}%`;
    }
  }
  statusBarItem.text = `$(clock) ${remainingText} ${percentage}%${weeklyText}`;

  // ── Build tooltip with table layout (panel-style) ──────────────────
  const allModelsData = api.parseAllModelsForTooltip(apiData);
  const md = new vscode.MarkdownString();
  md.isTrusted = true;
  md.supportHtml = true;

  // Helper: format number with K/M shorthand
  const formatNum = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toLocaleString();
  };

  // Helper: colored percentage span
  const pctSpan = (pct) => {
    const color = pct < 60 ? '#4ec9b0' : pct < 85 ? '#dcdcaa' : '#f44747';
    return `<span style="color:${color}"><strong>${pct}%</strong></span>`;
  };

  // ── Period header (use weekly period from API, not the 5h interval) ──
  // Use the user's local timezone so overseas users see intuitive dates.
  // For end timestamps, subtract 1s so that an exclusive boundary like
  // "next day 00:00:00" is displayed as the previous full day.
  let periodText = '';
  const fmt = (ts, isEnd = false) => {
    if (!ts) return '';
    let ms = ts < 1e12 ? ts * 1000 : ts;
    if (isEnd) ms -= 1000;
    return new Intl.DateTimeFormat(currentLanguage === 'tr-TR' ? 'tr-TR' : 'en-CA', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date(ms));
  };
  if (apiData.model_remains && apiData.model_remains.length > 0) {
    const firstModel = apiData.model_remains[0];
    periodText = `${fmt(firstModel.weekly_start_time)} — ${fmt(firstModel.weekly_end_time, true)}`;
  } else if (planTimeWindow) {
    periodText = `${fmt(planTimeWindow.start)} — ${fmt(planTimeWindow.end, true)}`;
  }

  let content = '';
  // Header: title left, period right (full-width table for proper alignment).
  // Markdown bold (**) is NOT parsed inside <td>, so use plain text and <strong>.
  const titleText = t("quotaPanel");
  const periodLabel = t("period");
  content += `<table width="100%" cellspacing="0" cellpadding="0"><tr>`;
  content += `<td align="left">${titleText}</td>`;
  content += `<td align="right">${periodLabel}: ${periodText}</td>`;
  content += `</tr></table>\n\n`;
  content += `---\n\n`;

  // ── Model table (single-row per model, 5 columns) ──────────────
  // Group headers act as natural section dividers — no spacer rows
  // (VS Code tooltip strips padding/height styles, so bold group titles
  // are the cleanest way to separate categories without wasted vertical space).
  const models = allModelsData.models || [];
  const colModel = t("colModel");
  const colUsage = t("colUsage");
  const colPct   = t("colPct");
  const colWeek  = t("colWeek");
  const colReset = t("colReset");

  const thStyle = 'style="padding:2px 6px;font-weight:normal;opacity:0.7"';
  const tdStyle = 'style="padding:2px 6px"';
  const groupStyle = 'style="padding:2px 6px;font-weight:bold"';

  // Group meta: name + colored dot (geometric ●, never rendered as emoji)
  const getGroupMeta = (model) => {
    const name = model.name || '';
    if (model.isTextModel) return { key: 'core', label: t("groupCore"), color: '#dcdcaa' };
    if (name.includes('coding-plan')) return { key: 'coding', label: t("groupCodingPlan"), color: '#9cdcfe' };
    if (
      name.includes('speech') ||
      name.includes('Hailuo') ||
      name.includes('music') ||
      name.includes('image') ||
      name.includes('lyrics')
    ) {
      return { key: 'media', label: t("groupMedia"), color: '#4ec9b0' };
    }
    return { key: 'other', label: t("groupOther"), color: '#888888' };
  };

  // HTML4 width attributes set per-column minimum width. CSS sizing is stripped
  // by VS Code's sanitizer, but the legacy `width="N"` attribute on <th>/<td>
  // survives and forces the table to expand, fixing tooltip width without
  // hardcoding total width (table still uses 100% for adaptive growth).
  content += `<table width="100%" cellspacing="0" cellpadding="0">\n`;
  content += `<tr>`;
  content += `<th width="140" align="left" ${thStyle}>${colModel}</th>`;
  content += `<th width="75"  align="right" ${thStyle}>${colUsage}</th>`;
  content += `<th width="45"  align="right" ${thStyle}>${colPct}</th>`;
  content += `<th width="75"  align="right" ${thStyle}>${colWeek}</th>`;
  content += `<th width="60"  align="right" ${thStyle}>${colReset}</th>`;
  content += `</tr>\n`;

  let currentGroup = '';
  for (const m of models) {
    const meta = getGroupMeta(m);
    if (meta.key !== currentGroup) {
      // Spacer row before non-first groups. VS Code strips CSS height/padding,
      // but the HTML4 `height` attribute on <tr> sometimes survives the sanitizer
      // and gives a ~6px gap (vs the ~20px of a full empty row).
      if (currentGroup) {
        content += `<tr height="6"><td colspan="5"></td></tr>\n`;
      }
      currentGroup = meta.key;
      const dot = `<span style="color:${meta.color}">●</span>`;
      content += `<tr><td colspan="5" ${groupStyle}>${dot} ${meta.label}</td></tr>\n`;
    }

    const used = m.usedCount;
    const total = m.totalCount;
    const pct = total > 0 ? Math.round((used / total) * 100) : 0;

    const rh = m.remainingTime.hours;
    const rm = m.remainingTime.minutes;
    const resetText = `${rh}h ${rm}m`;

    const weeklyCell = m.weeklyUnlimited
      ? '♾️'
      : `${formatNum(m.weeklyUsed)}/${formatNum(m.weeklyTotal)}`;

    let displayName = m.name;
    if (displayName.includes('Hailuo-2.3-Fast-6s-768p')) displayName = 'Hailuo-Fast';
    else if (displayName.includes('Hailuo-2.3-6s-768p')) displayName = 'Hailuo-2.3';

    content += `<tr>`;
    content += `<td align="left" ${tdStyle}><strong>${displayName}</strong></td>`;
    content += `<td align="right" ${tdStyle}>${formatNum(used)}/${formatNum(total)}</td>`;
    content += `<td align="right" ${tdStyle}>${pctSpan(pct)}</td>`;
    content += `<td align="right" ${tdStyle}>${weeklyCell}</td>`;
    content += `<td align="right" ${tdStyle}>${resetText}</td>`;
    content += `</tr>\n`;
  }

  content += `</table>\n\n`;
  content += `---\n\n`;

  // ── Bottom 3-column Token stats: Yesterday / Last 7 Days / This Month (real data from billing API) ──
  if (usageStats && (usageStats.lastDayUsage > 0 || usageStats.weeklyUsage > 0 || usageStats.planTotalUsage > 0)) {
    const lblYesterday = t("yesterday");
    const lbl7d        = t("last7Days");
    const lblMonth     = t("thisMonth");
    const unit         = t("tokens");

    const cellLabel = 'style="padding:2px 6px;opacity:0.6"';
    const cellValue = 'style="padding:2px 6px"';
    content += `<table width="100%" cellspacing="0" cellpadding="0">\n`;
    content += `<tr>`;
    content += `<td align="center" ${cellLabel}>${lblYesterday}</td>`;
    content += `<td align="center" ${cellLabel}>${lbl7d}</td>`;
    content += `<td align="center" ${cellLabel}>${lblMonth}</td>`;
    content += `</tr>\n<tr>`;
    content += `<td align="center" ${cellValue}><strong>${formatNum(usageStats.lastDayUsage)}</strong> ${unit}</td>`;
    content += `<td align="center" ${cellValue}><strong>${formatNum(usageStats.weeklyUsage)}</strong> ${unit}</td>`;
    content += `<td align="center" ${cellValue}><strong>${formatNum(usageStats.planTotalUsage)}</strong> ${unit}</td>`;
    content += `</tr>\n</table>\n\n`;
  }

  // ── Footer: expiry + updated time + refresh hint (right-aligned) ──
  // Use the user's local timezone for the "updated at" timestamp.
  const updatedAt = new Date().toLocaleTimeString(currentLanguage, {
    hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const updatedLabel = t("updated");
  const expiryText = expiry
    ? `${t("expiry")}: ${expiry.text}`
    : '';
  const clickToRefresh = t("clickToRefresh");
  const footerLine = [expiryText, `${updatedLabel} ${updatedAt}`, clickToRefresh].filter(Boolean).join(' · ');
  content += `<table width="100%" cellspacing="0" cellpadding="0"><tr>`;
  content += `<td align="right" style="opacity:0.55">${footerLine}</td>`;
  content += `</tr></table>`;

  md.appendMarkdown(content);
  statusBarItem.tooltip = md;
}

function deactivate() {
  // Extension deactivated
}

module.exports = {
  activate,
  deactivate,
};
