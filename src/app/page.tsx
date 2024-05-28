"use client"
import { useEffect, useState } from "react";
import {
  BiconomySmartAccountV2,
  PaymasterMode,
  createSmartAccountClient
} from "@biconomy/account";
import { Web3AuthProvider, useWeb3Auth } from "@web3auth/modal-react-hooks";
import { Web3Auth } from "@web3auth/modal";
import { getPublicCompressed } from "@toruslabs/eccrypto";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";

import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CHAIN_NAMESPACES } from "@web3auth/base";

import { ethers } from "ethers";

import styles from "./page.module.css";
import { contractABI } from "./contract/contractABI";
import { web3AuthContextConfig } from "./web3AuthProviderProps";





const chainConfigs = [
  {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x13882",
    chainCode: 80002,
    rpcTarget: "https://rpc-amoy.polygon.technology/",
    displayName: "Polygon Amoy",
    blockExplorerUrl: "https://www.oklink.com/amoy/tx/",
    ticker: "MATIC",
    tickerName: "Polygon",
    userRegistry: "0xe102a11Baf90eD02e054b883FAe3cd3C73137576",
    paymasterKey: process.env.NEXT_PUBLIC_PAYMASTER_KEY_AMOY,
    bundler: process.env.NEXT_PUBLIC_BUNDLER_AMOY
  },
  {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0xC3",
    chainCode: 195,
    rpcTarget: process.env.RPC_X_TEST!,
    displayName: "X Layer Test",
    blockExplorerUrl: "https://www.oklink.com/xlayer-test",
    ticker: "OKB",
    tickerName: "OKB",
    userRegistry: "0xe102a11Baf90eD02e054b883FAe3cd3C73137576",
    paymasterKey: process.env.NEXT_PUBLIC_PAYMASTER_KEY_X_TEST,
    bundler: process.env.NEXT_PUBLIC_BUNDLER_X_TEST,
  }
];

export default function Home() {
  // const {
  //   isConnected
  // } = useWeb3Auth();
  // console.log("Status", status);

  const [etherProvider, setEtherProvider] = useState<ethers.BrowserProvider>();
  const [etherSigner, setEtherSigner] = useState<ethers.JsonRpcSigner>();
  const [selectedChain] = useState(0);
  const [walletAddress, setWalletAddress] = useState<`0x${string}`>();
  const [smartWallet, setsmartWallet] = useState<BiconomySmartAccountV2>();
  const [isLogged, setIsLogged] = useState(false);
  const [isRegisterUser, setIsRegisterUser] = useState(false);
  const [EOAAddress, setEOAAddress] = useState<string>();
  const [txHash, setTxHash] = useState<string>();



  const privateKeyProvider = new EthereumPrivateKeyProvider({
    config: { chainConfig: chainConfigs[selectedChain] },
  });

  const metamaskAdapter = new MetamaskAdapter({
    clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENTID!,
    sessionTime: 3600, // 1 hour in seconds
    web3AuthNetwork: "sapphire_devnet",
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: chainConfigs[selectedChain].chainId,
      rpcTarget: chainConfigs[selectedChain].rpcTarget, // This is the public RPC we have added, please pass on your own endpoint while creating an app
    },
  });


  const web3auth = new Web3Auth({
    privateKeyProvider: privateKeyProvider,
    clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENTID!,
    web3AuthNetwork: "sapphire_devnet",
    sessionTime: (86400 * 7),
    uiConfig: {
      appName: "Veer Example",
      mode: "dark",
      loginMethodsOrder: ["google", "twitter", "apple", "email_passwordless", "discord", "twitter"],
      logoLight: "https://web3auth.io/images/web3auth-logo.svg",
      logoDark: "https://web3auth.io/images/web3auth-logo---Dark.svg",
      defaultLanguage: "en",
      loginGridCol: 3,
      primaryButton: "socialLogin",
    },
  });
  web3auth.configureAdapter(metamaskAdapter);


  const createWallet = async () => {
    if (!etherSigner || !chainConfigs[selectedChain].paymasterKey || !chainConfigs[selectedChain].bundler) {
      // TODO Handle error
      console.error("Ether Signer or biconomy Not Available");
      console.log("Ether Signer", etherSigner);
      console.log("chainConfigs", chainConfigs[selectedChain]);


      return null;
    }
    const sWallet = await createSmartAccountClient({
      signer: etherSigner,
      biconomyPaymasterApiKey: chainConfigs[selectedChain].paymasterKey!,
      bundlerUrl: chainConfigs[selectedChain].bundler!,
      rpcUrl: chainConfigs[selectedChain].rpcTarget
    });
    setsmartWallet(sWallet);
    const address = await sWallet.getAccountAddress();
    setWalletAddress(address);
    console.log("Smart wallet address", address);
  }

  const getToken = async () => {
    // Incase of secp256k1 curve, get the app_pub_key
    const app_scoped_privkey = await web3auth.provider?.request({
      method: "eth_private_key", // use "private_key" for other non-evm chains
    }) as string;
    const app_pub_key = getPublicCompressed(Buffer.from(app_scoped_privkey.padStart(64, "0"), "hex")).toString("hex");
    console.log(app_pub_key);
  }

  const connectUser = async () => {
    let web3authProvider = web3auth.provider;
    console.log(web3auth.connected);
    if (!web3auth.connected) {
      web3authProvider = await web3auth.connect();
    } else {
      setIsLogged(true)
    }
    if (!web3authProvider) {
      // TODO Handle Error
      console.error("web3authProvider Not Available");
      return null;
    }
    const user = await web3auth.getUserInfo();
    console.log(user);
    getToken();
    const ethersProvider = new ethers.BrowserProvider(web3authProvider);
    setEtherProvider(ethersProvider);

    const web3AuthSigner = await ethersProvider.getSigner();
    setEOAAddress(web3AuthSigner.address);
    setEtherSigner(web3AuthSigner);
  }

  const contractInstance = new ethers.Contract(
    chainConfigs[selectedChain].userRegistry,
    contractABI,
    etherSigner
  )

  const isRegistered = async () => {
    if (!walletAddress) {
      console.error("Wallet Address Not Available");
      return
    }
    console.log(walletAddress);
    const isUser = await contractInstance.isUserRegistered(walletAddress);
    setIsRegisterUser(isUser);
    console.log(isUser);
  }

  const registerUser = async () => {
    try {
      const registerTx = await contractInstance.register.populateTransaction();
      const tx1 = {
        to: chainConfigs[selectedChain].userRegistry,
        data: registerTx.data,
      };
      
      const amountInWei = await smartWallet?.getGasEstimate([tx1], {
        paymasterServiceData : { mode : PaymasterMode.SPONSORED}
      });
      console.log("Gas Estimate", amountInWei);
      
      // @ts-ignore
      const userOpResponse = await smartWallet?.sendTransaction(tx1, {
        paymasterServiceData: { mode: PaymasterMode.SPONSORED },
      });
      console.log(userOpResponse);
      if (!userOpResponse) {
        // TODO Handle
        return null;
      }
      const { transactionHash } = await userOpResponse.waitForTxHash();
      setTxHash(transactionHash);
      console.log("Transaction Hash", transactionHash);
    } catch (error) {
      console.log("Error in Registration", error);
    }
  }

  useEffect(() => {
    const init = async () => {
      console.log("Init Ran");

      await web3auth.initModal();
      if (!web3auth.connected) {
        console.log("Not Connected");
        return
      } else if (web3auth.connected) {
        console.log("Wallet Connected");
        connectUser();
      }
    }
    init();
  }, [])

  useEffect(() => {
    createWallet();
  }, [etherSigner])

  useEffect(() => {
    isRegistered();
  }, [walletAddress])

  return (
    <Web3AuthProvider config={web3AuthContextConfig}>
      <div className={styles.content}>
        <p>Connected Chain : {chainConfigs[selectedChain].displayName}</p>
        {isLogged ? (<p> User Logged In </p>) : (<p> User Logged Out </p>)}
        {EOAAddress ? (<p> EOA Address : {EOAAddress} </p>) : null}
        {walletAddress ? (<p> Smart Wallet Address : {walletAddress} </p>) : null}
        {isRegisterUser ? (<p> User Entry Done : True </p>) : null}
        {txHash ? (<p> Transaction Hash : {txHash} </p>) : null}

        <button type="button" className="btn btn-primary" onClick={connectUser} >Connect</button>
        <br />
        <br />
        <button type="button" className="btn btn-primary" onClick={() => {
          createWallet()
        }}>Create Wallet</button>
        <br />
        <br />
        <button type="button" className="btn btn-primary" onClick={isRegistered}>Check User</button>
        <br />
        <br />
        <button type="button" className="btn btn-primary" onClick={registerUser}>Register User</button>

      </div>
    </Web3AuthProvider>
  );
}
