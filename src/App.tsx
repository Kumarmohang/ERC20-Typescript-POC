import { useState } from "react";
import React from "react";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletLink from "walletlink";

import { ethers } from "ethers";
const ERC20_ABI = require("./ERC20abi.json");
const BATCH_ABI = require("./batch_abi.json");
let Conncted: string;
let contract: any;
let signer: any;
let provider: any;
let BatchContract: any;
const App: React.FC = () => {
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [contractApprove, setcontractapprove] = useState<string | null>(null);
  const [contractamount, setcontractamount] = useState<string | null>(null);
  const [contractERC20address, setERC20address] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState("");
  const [, setTxnHash] = useState("");
  const [txReceiveraddress, Receiveraddress] = useState<string | null>(null);
  const [txamount, amount] = useState<string | null>(null);

  const providerOptions = {
    binancechainwallet: {
      package: true,
    },
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: "765d4237ce7e4d999f706854d5b66fdc",
      },
    },
    walletlink: {
      package: WalletLink,
      options: {
        appName: "Net2Dev NFT Minter",
        infuraId: "765d4237ce7e4d999f706854d5b66fdc",
        rpc: "https://goerli.infura.io/v3/84919eaaed5a4d69a25598d76303923c",
        chainId: 5,
        appLogoUrl: null,
        darkMode: true,
      },
    },
  };

  const web3Modal = new Web3Modal({
    network: "goerli",
    theme: "dark",
    cacheProvider: true,
    providerOptions,
  });

  const handleMetamaskConnentClick = () => {
    connectToMetamask()
      .then((result) => {
        console.log({ result });
      })
      .catch((err) => {
        console.log({ err });
      });
  };

  /**
   * connectToMetamask() is used to connect the metask and udpate the @signer variable .
   * by using this @signer variable we can create a contract object for ERC20 or Amrit smart contract .
   */

  async function connectToMetamask(): Promise<void> {
    provider = new ethers.providers.Web3Provider((window as any).ethereum);
    //provider = await web3Modal.connect();
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    Conncted = await signer.getAddress();
    console.log("Account:", Conncted);
  }

  const HandleAmritSmartcontract = () => {
    if (contractERC20address) {
      erc20smartcontract(contractERC20address)
        .then((result) => {
          console.log({ result });
        })
        .catch((err) => {
          console.log({ err });
        });
    }
  };

  /**
   * @description erc20smartcontract() function is used to get the object for ERC20 or Amrit smart contract .
   * by using thie contract object we call approve() function in ERC20 or Amrit smart contract .
   * @param {String} erc20address
   */
  async function erc20smartcontract(erc20address: string): Promise<void> {
    let a = ethers.utils.isAddress(erc20address);
    if (a) {
      console.log("something", a);
      contract = new ethers.Contract(erc20address, ERC20_ABI, signer);
      console.log(contract);
    } else {
      console.log("its not address");
    }
  }

  const handleClickapprove = () => {
    if (contractApprove && contractamount) {
      setTransactionStatus("initiated");
      setTxnHash("");
      ApproveERC(contractApprove, contractamount)
        .then((result) => {
          console.log({ result });
        })
        .catch((err) => {
          console.log({ err });
        });
    }
  };
  /**
   * @description the purpose of ApproveERC() function is to maintain the status of the batch transaction .
   * i will call the approve() function and wait the transaction hash.
   * it will update the status of the transaction whether it got failed or completed successfully .
   * @param {String} spenderAddress
   * @param {String} spenderAmount
   * @returns
   */

  async function ApproveERC(spenderAddress: string, spenderAmount: string) {
    try {
      const txnReceipt = await approve(spenderAddress, spenderAmount);
      if (!txnReceipt) {
        console.log("wlenkf");
        return;
      }
      console.log(txnReceipt);
      const hash = txnReceipt.hash;
      console.log("starting the transactions");
      setTransactionStatus("processing");
      setTxnHash(hash);
      await txnReceipt.wait();
      let status = await provider.getTransactionReceipt(hash);
      console.log("transaction is successed or not ", status);
      setTransactionStatus("completed");
      console.log("transaction is completed successfully", {
        setTransactionStatus,
      });
      return;
    } catch (error) {
      setTransactionStatus("failed");
      console.log({ setTransactionStatus });
      return error;
    }
  }

  /**
   * @description approve() function will trigger when the user approve the invoices .
   * with the help of smart contract object it will call the approve() function in ERC20 or Amrit smart contract .
   * and it will also return transaction details /hash.
   * @param spenderAddress
   * @param spenderAmount
   * @returns
   */
  async function approve(
    spenderAddress: string,
    spenderAmount: string
  ): Promise<any> {
    console.log("before call function");
    let Spender_number: any = ethers.utils.parseEther(spenderAmount);
    //await GetEstimateFess(spenderAddress,Spender_number);
    // console.log(" GetFInal data is here ", GetFinal);

    // let GasPrice = await provider.getGasPrice();
    // console.log("Estimated GasPrice ,", ethers.utils.formatEther(GasPrice));
    // const functionGasFees = await contract.estimateGas.approve(spenderAddress,sp);
    // console.log("Function Gas fees estimation , ", ethers.utils.formatEther(0));
    // const Finalcost : any= GasPrice * functionGasFees;
    // console.log("Transaction Fees    ", ethers.utils.formatEther(Finalcost)
    const tx = contract.approve(spenderAddress, Spender_number);
    console.log("transaction return ", tx);
    return tx;
  }

  async function GetEstimateFess(
    spenderAddress: string,
    Spender_number: number
  ) {
    let GasPrice = await provider.getGasPrice();
    console.log("Estimated GasPrice ,", ethers.utils.formatEther(GasPrice));
    const functionGasFees = await contract.estimateGas.approve(
      spenderAddress,
      Spender_number
    );
    console.log("Function Gas fees estimation , ", ethers.utils.formatEther(0));
    const Finalcost: any = GasPrice * functionGasFees;
    console.log("Transaction Fees    ", ethers.utils.formatEther(Finalcost));
    // return ethers.utils.parseEther(Finalcost);
  }

  const handleClickBatch = () => {
    //  this is called when we click Batch transaction Button.
    if (
      contractAddress &&
      txamount &&
      txReceiveraddress &&
      contractERC20address
    ) {
      setTransactionStatus("initiated");
      setTxnHash("");
      console.log("contract addr", contractAddress);
      batch(contractAddress, contractERC20address, txReceiveraddress, txamount)
        .then((result) => {
          console.table(result);
        })
        .catch((err) => {
          console.table({ err });
        });
    }
  };

  /**
   * @description the purpose of batch() function is to maintain the status of the batch transaction .
   * it will call the batchTransaction() and wait the transaction hash.
   * it will update the status of the transaction whether it got failed or completed successfully .
   * @param {String} contractAddress
   * @param {String} contractERC20address
   * @param {String} txReceiveraddress
   * @param {String} txamount
   * @returns
   */

  async function batch(
    contractAddress: string,
    contractERC20address: string,
    txReceiveraddress: string,
    txamount: string
  ) {
    try {
      const txnReceipt = await batchTransaction(
        contractAddress,
        contractERC20address,
        txReceiveraddress,
        txamount
      );
      const hash = txnReceipt.hash;
      //console.log('starting the transactions');
      setTransactionStatus("processing");
      setTxnHash(hash);
      console.log("Hash value here ", hash);
      await txnReceipt.wait();
      let BCstatus = await provider.getTransactionReceipt(hash);
      console.log("transaction is successed or not ", BCstatus);
      let jsonstring = JSON.parse(BCstatus);
      console.log("Status is here  ", jsonstring);
      setTransactionStatus("completed");
      //console.log("transaction is completed successfully",{setTransactionStatus});
      return;
    } catch (error) {
      setTransactionStatus("failed");
      console.log({ setTransactionStatus });
    }
  }

  /**
   * @description batchTransaction() function will connect Metamask , if Metamask was not connected .
   * it creates BatchContract object using @batchContractAddress ,@BATCH_ABI AND @signer .
   * by using BatchContract object it will call the batchTransfer() in batch smart contract .
   * and it will return the transaction hash to batch() function.
   * @param  {String} batchContractAddress  is address of the Batch smart contract .
   * @param {String} contractERC20address  is Amrit or ERC20 smart contract address.
   * @param {String} txReceiveraddressString Receiver address.
   * @param {String} stringamount Receiver Amount.
   * @returns the Hash of the transactions.
   */
  async function batchTransaction(
    batchContractAddress: string,
    contractERC20address: string,
    txReceiveraddressString: string,
    stringamount: string
  ): Promise<any> {
    provider = new ethers.providers.Web3Provider((window as any).ethereum); //checking metamask installed and get the provider.
    //provider = await web3Modal.connect();
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner(); // getting the signer;
    BatchContract = new ethers.Contract(
      batchContractAddress,
      BATCH_ABI,
      signer
    ); // creating smart contract object .

    const amounts: string[] = stringamount.split(","); // splitting the stringamount string with comma(,) seperate and storing in string array variable .
    console.log({ amounts });
    const txReceiveraddresses: string[] = txReceiveraddressString.split(","); // splitting the txReceiveraddressString string with comma(,) seperate and storing in string array variable .
    //contract.estimateGas.saveUser(userAddress);
    let GasPrice = await provider.getGasPrice();
    console.log("Estimated GasPrice ,", ethers.utils.formatEther(GasPrice));
    const functionGasFees = await BatchContract.batchTransfer(
      contractERC20address,
      txReceiveraddresses,
      amounts
    );
    console.log(
      "Function Gas fees estimation , ",
      ethers.utils.formatEther(functionGasFees)
    );
    const Finalcost = GasPrice * functionGasFees;
    console.log("Transaction Fees    ", ethers.utils.formatEther(Finalcost));
    const result = BatchContract.batchTransfer(
      contractERC20address,
      txReceiveraddresses,
      amounts,
      { gasLimit: 4000000 }
    ); // calling the batchTransfer() from batch smart contract .
    console.log(" its not printing any thing please check the array data once");
    return result;
  }

  return (
    <>
      <h1>Connect Meta mask</h1>
      <label>
        <h2>MetaMask address :: {Conncted}</h2>
      </label>
      <br></br>
      <button onClick={handleMetamaskConnentClick}>click Button</button>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <label>
        {" "}
        Set Amrit smart contract
        <input
          onChange={(e) => {
            console.log("value", e.target.value);
            setERC20address(e.target.value);
          }}
        ></input>
      </label>
      <button onClick={HandleAmritSmartcontract}>Set AMR</button>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <h4>
        <label>for approve address && Amount </label>
      </h4>
      <input
        onChange={(e) => {
          console.log("value", e.target.value);
          setcontractapprove(e.target.value);
        }}
      ></input>
      <input
        onChange={(e) => {
          console.log("value", e.target.value);
          setcontractamount(e.target.value);
        }}
      ></input>
      <button onClick={handleClickapprove}>Approve the Amount</button>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <label>
        Pass the Batch smart contract address
        <input
          onChange={(e) => {
            console.log("value", e.target.value);
            setContractAddress(e.target.value);
          }}
        ></input>
      </label>
      <br></br>
      <br></br>
      <label>
        {" "}
        ERC20 address pass .
        <input
          onChange={(e) => {
            console.log("value", e.target.value);
            setERC20address(e.target.value);
          }}
        ></input>
      </label>
      <br></br>
      <br></br>
      <label>
        {" "}
        Receiver address .
        <input
          onChange={(e) => {
            console.log("value", e.target.value);
            Receiveraddress(e.target.value);
          }}
        ></input>
      </label>
      <br></br>
      <br></br>
      <label>
        {" "}
        batch payment .
        <input
          onChange={(e) => {
            console.log("value", e.target.value);
            amount(e.target.value);
          }}
        ></input>
      </label>
      <br></br>
      <br></br>
      <button onClick={handleClickBatch}>Batch transaction</button>
      <br></br>
      <div>
        <label>
          <h1>Status :: </h1>
        </label>
        <h2>{transactionStatus} </h2>
      </div>
    </>
  );
};

export default App;
