import React, { useState } from "react";
import { createSolanaRpc, address } from "@solana/web3.js";
import "./App.css";  // Import the CSS file

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [links, setLinks] = useState([]);
  const [url, setUrl] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const rpc = createSolanaRpc("https://sleek-neat-frog.solana-mainnet.quiknode.pro/b88d004bf58d30abde47d951dd8e483991d39204");

  const fetchWalletInfo = async () => {
    try {
      console.log("Fetching wallet info...");
      
      // Fetching wallet balance
      const { value: lamports } = await rpc.getBalance(address(walletAddress)).send();
      const solBalance = Number(lamports) / 1e9;  // Explicitly convert BigInt to Number
      setBalance(solBalance);  // Update the state with balance

      // Fetching last 10 transaction signatures
      const txSignatures = await rpc.getSignaturesForAddress(address(walletAddress), { limit: 10 }).send();
      console.log("Transaction Signatures:", txSignatures);

      const transactionLinks = txSignatures.map((tx, index) => {
        const explorerUrl = `https://explorer.solana.com/tx/${tx.signature}?cluster=mainnet-beta`;
        return { id: index, href: explorerUrl, text: `Transaction ${index + 1}` };
      });
      setLinks(transactionLinks);

      // Fetching full details of the first transaction
      if (txSignatures.length > 0) {
        const signature = txSignatures[0].signature;
        const transaction = await rpc.getTransaction(signature, { commitment: "confirmed" }).send();
        console.log("Transaction Details:", transaction);

        const explorerTransactionUrl = `https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`;
        setUrl(explorerTransactionUrl);
      }

      // Fetching full transaction details
      const transactionDetails = await Promise.all(
        txSignatures.map(async (tx) => {
          const details = await rpc.getTransaction(tx.signature, { commitment: "confirmed" }).send();
          return details;
        })
      );
      console.log("Transaction Details:", transactionDetails);
      setTransactions(transactionDetails);

    } catch (error) {
      console.error("Error fetching wallet info:", error);
    }
  };

  const toggleMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode", !darkMode);
    document.body.classList.toggle("light-mode", darkMode);
  };

  return (
    <div className={`container`}>
      <h1>
        ACCOUNT GEN<span className="flaming-i">I</span>E
      </h1>

      <input
        type="text"
        placeholder="Enter Solana Wallet Address"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        className="input-address"
      />

      <button className="button-animated" onClick={fetchWalletInfo}>Access Wallet Info</button>

      {balance !== null && <h2 className="balance">Balance: {balance} SOL</h2>}

      {links.length > 0 && (
        <div>
          <h3>Last 10 Transactions:</h3>
          <div className="transaction-buttons">
            {links.map((link, index) => (
              <button key={link.id} className="transaction-button">
                <span>{index + 1}. </span>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.text}
                </a>
              </button>
            ))}
          </div>
        </div>
      )}

      {url && (
        <div>
          <h3>Transaction Details:</h3>
          <p>
            View transaction details on Solana Explorer:
            <a href={url} target="_blank" rel="noopener noreferrer"> {url} </a>
          </p>
        </div>
      )}

      <button className="theme-toggle" onClick={toggleMode}>
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
    </div>
  );
}

export default App;
