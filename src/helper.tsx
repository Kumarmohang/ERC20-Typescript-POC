
import { ethers } from 'ethers'
const ERC20_ABI = require("./ERC20abi.json");
const BATCH_ABI=require('./batch_abi.json');
let connectedAddress:string;
let contract: any;
let signer:any ;
let provider:any;
let BatchContract:any;
  
  
//  const [contractAddress,setContractAddress] = useState<string | null>(null);
//  const [contractApprove,setcontractapprove] = useState<string | null>(null);
//  const [contractamount,setcontractamount]= useState<string | null>(null);
//  const [contractERC20address, setERC20address]= useState<string | null>(null);
//  const [transactionStatus, setTransactionStatus] = useState('');
//  const [, setTxnHash] = useState('');
//  const [txReceiveraddress, Receiveraddress]= useState<string | null>(null);
//  const [txamount, amount]= useState<string | null>(null); 

/**
 * connectToMetamask() is used to connect the metask and udpate the @signer variable .
 * by using this @signer variable we can create a contract object for ERC20 or Amrit smart contract .
 */

 async function connectToMetamask() : Promise<void> {
    provider = new ethers.providers.Web3Provider((window as any).ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    connectedAddress = await signer.getAddress();
    console.log("Account:", connectedAddress);
}


/**
 * @description erc20smartcontract() function is used to get the object for ERC20 or Amrit smart contract .
 * by using thie contract object we call approve() function in ERC20 or Amrit smart contract .
 * @param {String} erc20address 
 */
 async function erc20smartcontract(erc20address:string ): Promise<void> {
    contract =new ethers.Contract(erc20address,ERC20_ABI,signer);
    return contract
}

/**
 * @description erc20smartcontract() function is used to get the object for ERC20 or Amrit smart contract .
 * by using thie contract object we call approve() function in ERC20 or Amrit smart contract .
 * @param {String} erc20address 
 */
 async function batchSmartContract(batchContract:string ): Promise<void> {
    contract =new ethers.Contract(batchContract,BATCH_ABI,signer);
    return contract
}
      
    /**
     * @description the purpose of ApproveERC() function is to maintain the status of the batch transaction .
     * i will call the approve() function and wait the transaction hash.
     * it will update the status of the transaction whether it got failed or completed successfully .
     * @param {String} spenderAddress 
     * @param {String} spenderAmount 
     * @returns 
     */
    
    async function ApproveERC(spenderAddress:string,spenderAmount:string){
      try {
        const txnReceipt = await approve(spenderAddress,spenderAmount);
        const hash = txnReceipt.hash;
        console.log('starting the transactions');
        // setTransactionStatus('processing');
        // setTxnHash(hash);
        await txnReceipt.wait()
        // setTransactionStatus('completed');
        console.log("transaction is completed successfully");
        return {hash,status : "completed"}
      } catch (error) {
        // setTransactionStatus('failed');
        // console.log({setTransactionStatus});
        return {status : "failed"}
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
    async function approve(spenderAddress:string,spenderAmount:string) :Promise<any> {
      console.log("before call function");
      const tx= contract.approve(spenderAddress,spenderAmount);
      console.log({tx}, "nothign is printing");
      return tx; 
    }



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

async function batch(contractAddress:string,contractERC20address:string,txReceiveraddress:string,txamount:string){
    try {
      const txnReceipt = await batchTransaction(contractAddress,contractERC20address,txReceiveraddress,txamount);
      const hash = txnReceipt.hash;
      console.log('starting the transactions');
      await txnReceipt.wait()
      console.log("transaction is completed successfully");
      return
    } catch (error) {
      console.log({error});
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
  async function batchTransaction(batchContractAddress:string,contractERC20address:string,txReceiveraddressString:string,stringamount:string) :Promise<any> {                                            // getting the signer;
    BatchContract = await batchSmartContract(batchContractAddress)
    console.log({"batch contract": BatchContract});
    const amounts:string []=stringamount.split(",");                             // splitting the stringamount string with comma(,) seperate and storing in string array variable .
    console.log({amounts});
    const txReceiveraddresses:string[] = txReceiveraddressString.split(","); // splitting the txReceiveraddressString string with comma(,) seperate and storing in string array variable .
    const result= BatchContract.batchTransfer(contractERC20address,
    txReceiveraddresses,
    amounts,
    { gasLimit: 4000000 });                                                   // calling the batchTransfer() from batch smart contract .
    console.log("batch transaction results ");
    return result;
  
  }