// Extend the global Window interface to include Ethereum provider properties
interface Window {
  ethereum?: {
    // Method to request access to Ethereum accounts
    // Returns a Promise that resolves to an array of account addresses
    request: (args: { method: string }) => Promise<string[]>;

    // Method to listen for Ethereum events
    // Takes an event name and a callback function
    // The callback receives an array of account addresses
    on: (event: string, callback: (accounts: string[]) => void) => void;
  };
}
