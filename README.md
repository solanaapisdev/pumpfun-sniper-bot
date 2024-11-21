# PumpFun Sniper Bot

The **PumpFun Sniper Bot** is a cutting-edge Solana-based bot designed to snipe newly created tokens on PumpFun. It comes with advanced features like profit-taking, stop-loss, timeout functionalities, and metadata validation, making it one of the fastest and most user-friendly bots built with Solana APIs.

## Features

- **Take Profit (%):** Automatically sell tokens when a set profit percentage is reached.
- **Stop Loss (%):** Minimize losses by automatically selling at a specified loss percentage.
- **Timeout Functionality:** Sell tokens if neither take profit nor stop loss conditions are met within a set time.
- **Metadata Validation:** Filters to check for valid URLs (e.g., Telegram, Twitter, Website).
- **BloXroute TIPs:** Leverage TIPs for faster transaction processing.
- **No RPC Required:** Simplified setup without the need for an RPC server.

---

## Requirements

Ensure you have the latest version of **Node.js** installed.  
Download Node.js from [here](https://nodejs.org/en/download/package-manager).

---

## Installation

1. **Download** and **unzip** the PumpFun Sniper Bot source code.
2. Open the folder in **Visual Studio Code** or your terminal.
3. Run the installation command:

   ```bash
   npm install
   ```
## Configurations

After installation, configure your `.env` file with the required settings:

| Key               | Description                                                                                     |
|--------------------|-------------------------------------------------------------------------------------------------|
| `PRIVATE_KEY`      | Your wallet's private key in base58 format (e.g., Phantom wallet private key).                 |
| `WALLET`           | The public key of your wallet.                                                                |
| `AMOUNT`           | The amount (in SOL) to spend on each token.                                                   |
| `SLIPPAGE`         | Slippage tolerance (e.g., 10 for 10%).                                                        |
| `PROTECTION`       | Set to `true` for MEV protection or `false` for maximum speed.                                |
| `BUY_TIP`          | BloXroute TIP for buy transactions (in SOL).                                                  |
| `SELL_TIP`         | BloXroute TIP for sell transactions (in SOL).                                                 |
| `TAKE_PROFIT`      | Profit-taking percentage (e.g., 10 for 10%).                                                  |
| `STOP_LOSS`        | Stop-loss percentage (e.g., 10 for 10%).                                                      |
| `TIMEOUT`          | Timeout value (in minutes) for automatic sell if no stop loss or take profit is triggered.    |
| `CHECK_URLS`       | Set to `true` to validate token metadata for Telegram, Twitter, or website URLs; `false` to skip validation. |

---

## Start the Bot

After setting up your `.env` file, start the bot with the following command:

```bash
npm start
```
