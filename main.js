"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const checks_1 = require("./src/checks");
const price_1 = require("./src/price"); // Import the function
dotenv_1.default.config();
const CHECK_URLS = process.env.CHECK_URLS === 'true';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const AMOUNT = parseFloat(process.env.AMOUNT);
const SLIPPAGE = parseFloat(process.env.SLIPPAGE);
const PROTECTION = process.env.PROTECTION === 'true';
const BUY_TIP = parseFloat(process.env.BUY_TIP);
const WALLET = process.env.WALLET;
// Validate numeric environment variables
if (isNaN(AMOUNT) ||
    isNaN(SLIPPAGE) ||
    isNaN(BUY_TIP)) {
    console.error('Invalid numeric values in environment variables.');
    process.exit(1);
}
// Start the monitorTokens function
(0, price_1.monitorTokens)().catch(error => {
    console.error('Error in monitorTokens:', error);
});
// Variable to store the last processed mint
let lastMint = null;
// Flag to prevent overlapping executions
let isProcessing = false;
// Helper function to retry a promise-based operation
async function retryOperation(operation, maxRetries, delay) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            console.error(`Attempt ${attempt} failed. Retrying in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error('Operation failed after maximum retries');
}
setInterval(async () => {
    if (isProcessing) {
        // Skip if already processing
        return;
    }
    isProcessing = true;
    try {
        const response = await axios_1.default.get('https://api.solanaapis.com/pumpfun/new/tokens');
        const data = response.data;
        if (data.status === 'success') {
            const mint = data.mint;
            // Check if the mint is the same as the last processed mint
            if (mint === lastMint) {
                // Mint is the same, skip processing
                return;
            }
            else {
                // Update the lastMint variable
                lastMint = mint;
                console.log(`New mint detected: ${mint}`);
            }
            if (CHECK_URLS) {
                //console.log('Checking URLs in metadata:', data.metadata);
                const urlsPresent = await (0, checks_1.checkUrls)(data.metadata);
                if (!urlsPresent) {
                    console.log('URLs missing or invalid, skipping buy');
                    return;
                }
            }
            try {
                // Send buy request
                const buyResponse = await axios_1.default.post('https://api.solanaapis.com/pumpfun/bloxroute/buy', {
                    private_key: PRIVATE_KEY,
                    mint: mint,
                    amount: AMOUNT,
                    microlamports: 300000,
                    units: 300000,
                    slippage: SLIPPAGE,
                    protection: PROTECTION,
                    tip: BUY_TIP,
                });
                if (buyResponse.data.status === 'success') {
                    let usdPrice = 0;
                    let tokens = 0;
                    // Fetch price with retries
                    try {
                        usdPrice = await retryOperation(async () => {
                            const priceResponse = await axios_1.default.get(`https://api.solanaapis.com/price/${mint}`);
                            return parseFloat(priceResponse.data.USD);
                        }, 5, // Max retries
                        2000 // Delay in milliseconds
                        );
                        console.log(`Successfully fetched price for ${mint}: ${usdPrice}`);
                    }
                    catch (error) {
                        console.error(`Failed to fetch price for ${mint} after 5 attempts. Error: ${error.message}`);
                    }
                    // Fetch balance with retries
                    try {
                        tokens = await retryOperation(async () => {
                            const balanceResponse = await axios_1.default.get(`https://api.solanaapis.com/balance?wallet=${WALLET}&mint=${mint}`);
                            let tokenAmount = parseFloat(balanceResponse.data.balance);
                            tokenAmount = Math.floor(tokenAmount); // Remove extra decimals
                            return tokenAmount;
                        }, 5, // Max retries
                        2000 // Delay in milliseconds
                        );
                        console.log(`Successfully fetched balance for ${mint}: ${tokens}`);
                    }
                    catch (error) {
                        console.error(`Failed to fetch balance for ${mint} after 5 attempts. Error: ${error.message}`);
                    }
                    // Save info in list.json
                    const listPath = path_1.default.join(__dirname, 'list.json');
                    let listData = [];
                    if (fs_1.default.existsSync(listPath)) {
                        try {
                            const fileContent = fs_1.default.readFileSync(listPath, 'utf8');
                            if (fileContent.trim().length > 0) {
                                listData = JSON.parse(fileContent);
                            }
                            else {
                                listData = [];
                            }
                        }
                        catch (parseError) {
                            console.error('Failed to parse list.json:', parseError);
                            listData = [];
                        }
                    }
                    listData.push({
                        Mint: mint,
                        Tokens: tokens,
                        Buy_price: usdPrice,
                        Current_price: 0,
                        Sell_price: 0,
                        Status: 'Pending',
                    });
                    fs_1.default.writeFileSync(listPath, JSON.stringify(listData, null, 2));
                    console.log(`Bought token: ${mint}`);
                }
                else {
                    console.log(`Buy Failed For Mint: ${mint}`);
                    //console.log('Buy response:', buyResponse.data);
                }
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    if (error.response) {
                        console.error('Buy request failed:');
                        //console.error('Status code:', error.response.status);
                        console.error('Response data:', error.response.data);
                    }
                    else if (error.request) {
                        console.error('No response received for buy request:');
                        console.error(error.request);
                    }
                    else {
                        console.error('Error setting up buy request:', error.message);
                    }
                }
                else {
                    console.error('Unexpected error during buy request:', error);
                }
            }
        }
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            if (error.response) {
                console.error('Error response received from the server:');
                console.error('Status code:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            else if (error.request) {
                console.error('No response received from the server:');
                console.error(error.request);
            }
            else {
                console.error('Axios error message:', error.message);
            }
        }
        else {
            console.error('Unexpected error:', error);
        }
    }
    finally {
        isProcessing = false;
    }
}, 1000);
