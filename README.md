# MiniMax StatusBar (Fork)

This is a fork of the original [minimax-status](https://github.com/JochenYang/minimax-status) project with the following changes:

## Changes from Original

### Domain Update
- API endpoint updated from `minimaxi.com` to `minimax.io`

### Simplified API Key System
- Removed dual API key system (domestic/overseas)
- Now uses single API key only
- Configuration simplified

### Internationalization (i18n)
- Added full i18n support with language selector
- Supported languages: English (en-US), Turkish (tr-TR)
- All hardcoded strings moved to centralized i18n object
- Language can be changed from Settings page

### UI Improvements
- Settings page now includes language dropdown
- All UI text is translatable
- Status bar and tooltip text respects selected language

## Original Features

- ✅ Real-time token usage monitoring
- ✅ Status bar integration for VS Code
- ✅ Intelligent color coding based on usage percentage
- ✅ Cross-session context tracking
- ✅ Secure credential storage

## Versions

| Component | Version | Installation |
|-----------|---------|--------------|
| **CLI** | 1.2.0 | `npm install -g minimax-status` |
| **VSCode** | 1.3.3 | [VSCode Marketplace (original)](https://marketplace.visualstudio.com/items?itemName=JochenYang.minimax-status-vscode) or [Download VSIX (my fork)](https://github.com/bruhmomentumtr/minimax-status/releases) |

## Features

- ✅ **Real-time monitoring**: Display MiniMax Token-Plan usage, remaining calls, reset time
- ✅ **Context window tracking**: Intelligent transcript parsing, accurate context usage display
- ✅ **Multiple display modes**: Detailed, compact, continuous status bar
- ✅ **Claude Code integration**: Display in Claude Code status bar
- ✅ **Intelligent color coding**: Auto-switch colors based on usage percentage
- ✅ **Cross-session support**: Auto-find context from project history
- ✅ **Simple commands**: `minimax status` to view status
- ✅ **Secure storage**: Credentials stored in separate config file

## Quick Start

### 1. Install

```bash
npm install -g minimax-status
```

### 2. Update (if already installed)

```bash
npm update -g minimax-status
```

### 3. Configure authentication

```bash
minimax auth <token>
```

Config will be saved in `~/.minimax-config.json`.

Get token:

1. Visit [MiniMax Platform](https://platform.minimax.io/)
2. Login and go to console
3. Create or get API Key from Coding Plan

### 4. View status

```bash
# Detailed mode
minimax status

# Compact mode
minimax status --compact

# Watch mode
minimax status --watch
```

## VSCode Extension

VSCode extension version with status bar display.

### Installation

**Method 1: From VSCode Marketplace (Recommended)**

1. Search "MiniMax Status" in VSCode
2. Click Install

**Method 2: Download VSIX file**

1. Visit [GitHub Releases](https://github.com/bruhmomentumtr/minimax-status/releases)
2. Download latest `.vsix` file
3. Press `Ctrl+Shift+P` in VSCode
4. Type "Extensions: Install from VSIX..."
5. Select downloaded VSIX file

**Method 3: Build from source**

```bash
git clone https://github.com/bruhmomentumtr/minimax-status.git
cd minimax-status/vscode-extension
npm install
npm run package
# Install the generated .vsix file in VSCode
```

### Configuration steps

1. After installing, click "MiniMax: Needs Configuration" in status bar
2. Or use command "MiniMax Status: Configuration Wizard"
3. Enter your API Key
4. After configuration, status bar will show real-time usage status

## Claude Code Integration

Display MiniMax usage status in Claude Code status bar.

### Configuration steps

1. **Install and configure tool**:

   ```bash
   npm install -g minimax-status
   minimax auth <token>
   ```

2. **Configure Claude Code**:

   Edit `~/.claude/settings.json`:

   ```json
   {
     "statusLine": {
       "type": "command",
       "command": "minimax statusline"
     }
   }
   ```

3. **Restart Claude Code**

After successful integration, status bar will display:

```
cli ❯  main * ❯ MiniMax-M* ❯ 205K ❯ 0% (4500/4500) · W ∞ ❯ 4h59m ❯ 336d
```

Display format: `directory ❯ branch ❯ model ❯ context ❯ percentage(used/total) · weekly ❯ countdown ❯ expiry days`

**Color guide**:

- **Usage**: ≥85% red | 60-85% yellow | <60% green
- **Expiry**: ≤3 days red | ≤7 days yellow | >7 days green

### Git Branch Display

Status bar shows current Git branch info:

```
my-app │ main * │ ...
```

**Symbol guide**:

| Symbol | Meaning |
|--------|---------|
| * | Uncommitted changes |

**Color rules**:

| Element | Color | Description |
|---------|-------|-------------|
| Main branch (main/master) | Green | Default/main branch |
| Other branches | White | Normal feature branch |
| ⬆ Not pushed | Yellow | Commits to push |
| ⬇ Not pulled | Cyan | Commits to pull |
| • Uncommitted | Red | Uncommitted changes in workspace |

### Context Window Display

Status bar intelligently shows current session context window usage:

- **With transcript data**: Shows `⚡ percentage·used tokens`
  - Example: `⚡ 85%·150.0k tokens` means 150K tokens used, 85% of capacity

- **Without transcript data**: Shows only context window total capacity
  - Example: `200K` means current model's context window size

**Smart features**:

- ✅ Auto-parse Claude Code transcript files
- ✅ Support Anthropic and OpenAI token formats
- ✅ Correct cache tokens calculation (cache creation + cache read)
- ✅ Cross-session lookup: if current session has no data, auto-find from project history
- ✅ Handle summary entries and leafUuid references

**Note**: MiniMax config is stored separately in `~/.minimax-config.json`, independent from Claude Code config.

## Droid Integration

Display MiniMax usage status in Droid status bar.

### Configuration steps

1. **Install and configure tool**:

   ```bash
   npm install -g minimax-status
   minimax auth <token>
   ```

2. **Configure Droid**:

   Edit `~/.factory/settings.json`:

   ```json
   {
     "statusLine": {
       "type": "command",
       "command": "minimax droid-statusline"
     }
   }
   ```

3. **Restart Droid**

After successful integration, status bar will display:

```
cli ❯  main * ❯ MiniMax-M* ❯ 205K ❯ 0% (4500/4500) · W ∞ ❯ 4h59m ❯ 336d
```

Display format: `directory ❯ branch ❯ model ❯ context ❯ percentage(used/total) · weekly ❯ countdown ❯ expiry days`

**Color guide**:

- **Usage**: ≥85% red | 60-85% yellow | <60% green
- **Expiry**: ≤3 days red | ≤7 days yellow | >7 days green

## Display Examples

### Detailed Mode

```
┌──────────────────────────────────────────────────────┐
│ MiniMax Claude Code Usage Status                     │
│                                                      │
│ Current Model: MiniMax-M*                            │
│ Time Window: 05:00-10:00(UTC+8)                      │
│ Remaining Time: 6 minutes until reset                 │
│                                                      │
│ Usage: █░░░░░░░░░░░░░░░░░░░░░░░░░░ 7%               │
│      Remaining: 4172/4500 calls                      │
│                                                      │
│ Weekly Limit: Unlimited                              │
│ Plan Expiry: 03/19/2027 (336 days remaining)         │
│                                                      │
│ 📊 Token Consumption Stats                            │
│  Yesterday: 53.8M                                     │
│  Last 7 days: 480M                                   │
│  This month: 1.5B                                     │
│                                                      │
│ 📋 All Model Quotas                                  │
│   MiniMax-M*     7%   328/4500    ✓                  │
│   speech-hd      0%   0/19000     ✓                  │
│   Hailuo         0%   0/3         ✓                  │
│   ...                                            │
│                                                      │
│ Status: ✓ Normal                                     │
└──────────────────────────────────────────────────────┘
```

### Compact Mode

```
● MiniMax-M* 0% (4498/4500) • 4h59m until reset • ✓ Normal • 336d remaining
```

### Continuous Status Bar Mode

```
✓ MiniMax Status Bar started
Press Ctrl+C to exit

[● MiniMax-M2 27% • 3307/4500 • 1h26m ⚡
```

## Screenshots

### Claude Code Integration

![Claude Code StatusBar](./images/claude%20code.png)

### Droid Integration

![Droid StatusBar](./images/droid.png)

## Command Reference

| Command | Description | Example |
|---------|-------------|---------|
| `minimax auth` | Set authentication | `minimax auth <token>` |
| `minimax status` | Show usage status (supports --compact, --watch) | `minimax status` |
| `minimax bar` | Terminal bottom persistent status bar | `minimax bar` |
| `minimax statusline` | Claude Code status bar integration | For Claude Code config |
| `minimax droid-statusline` | Droid status bar integration | For Droid config |

## Status Guide

### Display Elements

| Element | Description |
|---------|-------------|
| Directory | Current working directory |
| Branch | Git branch name (with uncommitted status) |
| Model | MiniMax model name |
| Context | Context window usage tokens |
| Usage | Usage percentage (used/total) |
| Weekly | Weekly quota, ∞ means unlimited |
| ⏱ | Quota reset countdown |
| Expiry | Subscription expiry (color changes dynamically) |

### Color Rules

| Scenario | Color | Description |
|----------|-------|-------------|
| Context ≥85% | Red | Danger |
| Context 60-85% | Yellow | Use with caution |
| Context <60% | Green | Normal |
| Expiry ≤ 3 days | Red | Expiring soon |
| Expiry ≤ 7 days | Yellow | Expiring soon |
| Expiry > 7 days | Green | Subscription OK |

## Configuration Files

### Default Location

- Separate config file: `~/.minimax-config.json`

### Config Example

```json
{
  "token": "your_access_token_here"
}
```

### Claude Code Config

Claude Code only needs status bar command:

```json
// ~/.claude/settings.json
{
  "statusLine": {
    "type": "command",
    "command": "minimax statusline"
  }
}
```

### Security Note

Credentials are stored locally only, never uploaded to any server.

## Troubleshooting

### Command not found

```bash
# Ensure globally installed
npm install -g minimax-status

# Reopen terminal
```

### Authentication failed

```bash
# Check token
minimax status

# Reset authentication
minimax auth <new_token>
```

### Status bar not showing

1. Check Claude Code config
2. Restart Claude Code
3. Manual test: `minimax statusline`

## Development

### Build project

```bash
git clone <repository>
cd minimax-status
npm install
```

### Test

```bash
# Run example
node cli/example.js

# Test CLI command
node cli/index.js status
```

## License

MIT License - See [LICENSE](LICENSE) file

## Contributing

Issues and Pull Requests are welcome!

## Navigation

| Client | Path | Description |
|--------|------|-------------|
| **CLI** | [`cli/`](cli/) | Command line tool, npm global package |
| **VSCode** | [`vscode-extension/`](vscode-extension/) | VSCode status bar integration |

---

## Related Links

- [MiniMax Platform](https://platform.minimax.io/)

---

## Fork Changes (vs Original)

This fork differs from the original in the following ways:

### 1. Domain Change
- API endpoint: `minimaxi.com` → `minimax.io`

### 2. Single API Key
- Removed dual key system (domestic/overseas)
- Now uses single API key only

### 3. Internationalization
- Added language selector (English, Turkish)
- All hardcoded strings centralized in i18n object
- Change language from Settings page

### 4. Build Info
| Component | Version |
|-----------|---------|
| CLI | 1.2.0 |
| VSCode | 1.3.3 |

---

**Note**: This tool only monitors MiniMax Token-Plan usage status, no user data is stored or transmitted.
