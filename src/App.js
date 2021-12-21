import Web3 from "web3"
import {useState,useEffect} from "react"
import { ethers } from "ethers";
function App() {
  const [wallet,setWallet]=useState("");
  const [SGCBalance,setSGCBalance]=useState("");
  const [SGCBalanceW,setSGCWBalance]=useState("");
  const [reward,setReward]=useState("");
  const [loading,setLoading]=useState(false);
  const [BNBBalance,setBNBBalance]=useState("");
  const [claimFee,setClaimFee]=useState("");
  const [bnbPrice,setBNBPrice]=useState();
  useEffect(async()=>{
    setBNBPrice(await calcBNBPrice());
  },[])
  const spinner=<div class="spinner-border spinner-border-sm" role="status"></div>
  const walletLoginHandler=async()=>{
    setLoading(true);
    await getGasForClaim();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    let contractAddress = "0xed46d1756322bf01d39b5f9e62d209c5a0e16925";
    let minABI = [  {
      "inputs": [
        { "internalType": "address", "name": "account", "type": "address" }
      ],
      "name": "balanceOf",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "account", "type": "address" }
      ],
      "name": "withdrawableDividendOf",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    }
  ];
    const rpcURL = 'https://bsc-dataseed.binance.org/'
        const web3 = new Web3(rpcURL)
    let contract = new web3.eth.Contract(minABI,contractAddress);
    const BNBBalance=await web3.eth.getBalance(contractAddress);
    const SGCBalance=await contract.methods.balanceOf(contractAddress).call();
    const SGCBalanceW=await contract.methods.balanceOf(accounts[0]).call();
    const rewardBalance=await contract.methods.withdrawableDividendOf(accounts[0]).call();
    setBNBBalance(BNBBalance);
    setReward(rewardBalance)
    setSGCBalance(SGCBalance);
    setSGCWBalance(SGCBalanceW);
    setWallet(accounts[0]);
    setLoading(false);
  }
  const getGasForClaim=async()=>{
    const web3 = new Web3(window.ethereum)
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    let contractAddress = "0xed46d1756322bf01d39b5f9e62d209c5a0e16925";
    let minABI = [{
      "inputs": [],
      "name": "claim",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
let contract = new web3.eth.Contract(minABI,contractAddress);
await contract.methods.claim().estimateGas(
  {
      from: accounts[0],
      gas:50000
  }, function(error, estimatedGas) {
    setClaimFee(estimatedGas*0.000000005);
  }
);



  }
  const claimHandler=async()=>{
    const web3 = new Web3(window.ethereum)
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    let contractAddress = "0xed46d1756322bf01d39b5f9e62d209c5a0e16925";
    let minABI = [{
      "inputs": [],
      "name": "claim",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
let contract = new web3.eth.Contract(minABI,contractAddress);

  await contract.methods.claim().send({from:accounts[0]});



  }


  async function calcBNBPrice(){
    const pancakeSwapContract = "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7";
    const pancakeSwapAbi=[ {
      "inputs": [
        { "internalType": "uint256", "name": "amountIn", "type": "uint256" },
        { "internalType": "address[]", "name": "path", "type": "address[]" }
      ],
      "name": "getAmountsOut",
      "outputs": [
        { "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }
      ],
      "stateMutability": "view",
      "type": "function"
    }];
    const web3 = new Web3("https://bsc-dataseed1.binance.org");
    const BNBTokenAddress = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c" //BNB
    const USDTokenAddress  = "0x55d398326f99059fF775485246999027B3197955" //USDT
    let bnbToSell = web3.utils.toWei("1", "ether") ;
    let amountOut;
    try {
        let router = await new web3.eth.Contract( pancakeSwapAbi, pancakeSwapContract );
        amountOut = await router.methods.getAmountsOut(bnbToSell, [BNBTokenAddress ,USDTokenAddress]).call();
        amountOut =  web3.utils.fromWei(amountOut[1]);
    } catch (error) {}
    if(!amountOut) return 0;
    return amountOut;
}






  return (
   <>
   <div className="container mt-4">
     <table>
       <td>
       <tr>
       <h1>SafeGameCash BNB Rewards</h1>
       </tr>
       <tr>
       <img src="logo512.png" width="100px" />
       </tr>
       <tr>
       <p>BNB Price: {!loading?bnbPrice:spinner} {bnbPrice&&" $"}</p>
       </tr>
       <tr>
       <p>SGC Balance of Contract: {!loading?SGCBalance/1000000000:spinner} {SGCBalance&&"SGC"}</p>
       </tr>
       <tr>
       <p>BNB Balance of Contract: {!loading?Web3.utils.fromWei(BNBBalance,"ether"):spinner} {BNBBalance&&"BNB"}</p>
       </tr>
       <tr>
       <p>SGC Balance of Your Wallet: {!loading?SGCBalanceW/1000000000:spinner} {SGCBalanceW&&"SGC"} </p>
       </tr>
       <tr>
       <p>Reward of Your Wallet: {!loading?Web3.utils.fromWei(reward,"ether"):spinner} {reward&&"BNB"}</p>
       </tr>
       <tr>
       <p>Reward of Your Wallet (USD): {!loading?Web3.utils.fromWei(reward,"ether")*bnbPrice:spinner} {reward&&" $"}</p>
       </tr>
       <tr>
       <p>Estimated gas fee for claim: {!loading?claimFee:spinner} {claimFee&&"BNB"}</p>
       </tr>
       <tr>
       <p>Estimated gas fee for claim (USD): {!loading?claimFee*bnbPrice:spinner} {claimFee&&" $"}</p>
       </tr>
       <tr>
       <button onClick={walletLoginHandler} type="button" class="btn btn-primary w-100">{!loading?<>{wallet?wallet:"Connect"}</>:spinner}</button>
       </tr>
       <tr>
       <button disabled={!wallet} onClick={claimHandler} type="button" class="btn btn-primary w-100 mt-2">{loading?spinner:"Claim"}</button>
       </tr>
       </td>
     </table>
   </div>
   
   </>
  );
}

export default App;
