import { Web3AuthContextConfig } from "@web3auth/modal-react-hooks";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { Web3AuthOptions } from "@web3auth/modal";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { WalletServicesPlugin } from "@web3auth/wallet-services-plugin";

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
const selectedChain = 0;
const privateKeyProvider = new EthereumPrivateKeyProvider({
    config: { chainConfig: chainConfigs[selectedChain] },
});

const web3AuthOptions: Web3AuthOptions = {
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
};

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

const openloginAdapter = new OpenloginAdapter();

const walletServicesPlugin = new WalletServicesPlugin({
    wsEmbedOpts: {},
    walletInitOptions: { whiteLabel: { showWidgetButton: true } },
});


export const web3AuthContextConfig: Web3AuthContextConfig = {
    web3AuthOptions,
    adapters: [metamaskAdapter, openloginAdapter],
    plugins: [walletServicesPlugin],
};