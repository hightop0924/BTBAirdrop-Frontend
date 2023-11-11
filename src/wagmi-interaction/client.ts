import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import Web3 from 'web3';

// Connect to the Ethereum node
const web3 = new Web3(process.env.REACT_APP_WEB3_RPC); // Use your Infura Project ID

// Function to get the transaction receipt
export const getTransactionReceipt = async (txHash, maxAttempts = 10, interval = 3000) => {
  let receipt = null;
  let attempts = 0;
  
  console.log(`Checking receipt for transaction: ${txHash}`);

  while (attempts < maxAttempts && !receipt) {
    try {
      receipt = await web3.eth.getTransactionReceipt(txHash);
      if (receipt) {
        console.log('Transaction receipt:', receipt);
        return receipt;
      }
      // Wait for interval milliseconds before trying again
      await new Promise(resolve => setTimeout(resolve, interval));
      attempts++;
    } catch (error) {
      console.error("Error fetching transaction receipt: ", error);
      // If there's an error (e.g., network issue), retry after the interval
      await new Promise(resolve => setTimeout(resolve, interval));
      attempts++;
    }
  }

  throw new Error('Transaction receipt not found after maximum attempts');
};


export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
