import * as React from "react";
import { useEffect, useState } from "react";
import '../../App.css'
import abi from '../../utils/WavePortal.json'

import { RotatingLines } from 'react-loader-spinner'
import { ethers } from "ethers";
import Header from "../Header/Header";


const getEthereumObject = () => window.ethereum;

const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();
    if (!ethereum) {
      console.error("Make sure you have Metamask!");
      return null;
    }
    console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};


export default function Main() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState('');
  const [loader, setLoader] = useState(false);


  const contractAddress = "0xC1711B2385cA54B55F1e9f6C848fC6Ad10C72B4D";

  const contractABI = abi.abi;

  useEffect(() => {
    (async () => {
      const account = await findMetaMaskAccount();
      if (account !== null) {
        setCurrentAccount(account);
        getAllWaves()
      }
    })()
  }, []);

  useEffect(()=>{
    (async()=>{ 
      const ethereum = getEthereumObject();
      if(ethereum){
        let chainId = await ethereum.request({ method: 'eth_chainId' });
        console.log("Connected to chain " + chainId);
        const sepoliaChainId = "0xaa36a7";
        if (chainId !== sepoliaChainId) {
          alert("You are not connected to the sepolia Test Network!");
        }
      }
    }
    )() 
  },[])

  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };


  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
        setLoader(true)
        setTimeout(() => {
          setMessage('')
        }, 500)
       
        console.log("Mining...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        setLoader(false)

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }


  const getAllWaves = async () => {
    const { ethereum } = window;
  
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const waves = await wavePortalContract.getAllWaves();
  
        const wavesCleaned = waves.map(wave => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });
  
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let wavePortalContract;
  
    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };
  
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }
  
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);


  return (
    <div className="mainContainer">
      <Header currentAccount={currentAccount} connectWallet={connectWallet}/>
       <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>
        <div className="bio">
          I am shivam i am working with web3 skills? Connect your Ethereum wallet(click on metamask icon) and wave at me!
        </div>

        <div className="msg-container">
          <label htmlFor="msg">your message:</label>
          <input className="msg-input" type={'text'} placeholder='type your message' value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>

        {loader ?<div style={{margin:'0 auto'}}> <RotatingLines
          strokeColor="grey"
          strokeWidth="5"
          animationDuration="0.75"
          width="46"
          visible={true}
          height='30'
        /></div> : <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>}

        <div className="waveinfo-block">
        {allWaves.map((wave, index) => {
          return (
            <div key={index} className="wave-info">
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
        </div>  
      </div> 
    </div>
  );
}

