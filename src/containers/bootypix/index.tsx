import Image from "next/image";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  CHAIN_ID,
  CONTRACT_ADDRESS,
  MAX_TOKENS,
  NETWORK,
  SALE_PAUSED,
  TOKEN_PRICE,
  USE_MUSIC,
} from "../../constants";
import useContract from "../../hooks/useContract";
import useWallet from "../../hooks/useWallet";
import toast from "react-hot-toast";

import logo from "../../../public/logo.png";
import twitterLogo from "../../../public/twitter-icon.png";
import etherscanLogo from "../../../public/etherscan-icon.png";
import openseaBtn from "../../../public/opensea.png";
import { ConnectWalletBtn, OpenseaBtn } from "./buttons";
import { Audio } from "./audio";
import If from "../../components/If";
import Mint from "./Mint";
import useSound from "use-sound";

import soundOn from "../../../public/sound_on.png";
import soundOff from "../../../public/sound_off.png";

const BUTTON_TEXT = {
  MINT: "Mint for Free",
  MINT_SALE: "Mint for ",
  EXCEEDS: "Token exceeds limit",
  TRANSACTION: "Confirm Transaction",
  MINTING: "Minting...",
  SOLD_OUT: "Sold Out",
  PRESALE_NOT_ALLOWED: "Not Allowed to Buy",
  NO_SALE: "Coming Soon, Stay Tuned",
};

const condense = (text: string) => {
  return `${text?.substring(0, 5)}...${text?.substring(text.length - 5)}`;
};

export const getBlockExplorer = () => {
  const chain = parseInt(CHAIN_ID);
  const contractAddress = CONTRACT_ADDRESS;
  switch (chain) {
    case 1:
      return `https://etherscan.io/address/${contractAddress}`;
    case 5:
      return `https://goerli.etherscan.io/address/${contractAddress}`;
  }
};

const BootyPixPage = () => {
  const [connected, setConnected] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [user, provider, signer, connectWallet] = useWallet();
  const [noOfTokens, setNoOfTokens] = useState<string>("");
  const [noSale, setNoSale] = useState(false);
  const [disabledMintButton, setDisabledMintButton] = useState(true);
  const [disabledMintInput, setDisabledMintInput] = useState(false);
  const [buttonText, setButtonText] = useState("Mint for Free");

  const [totalSupply, setTotalSupply] = useState<number>();
  const [maximumTokens, setMaximumTokens] = useState<number>();

  const [contract] = useContract(CONTRACT_ADDRESS, provider);

  const [maxPurchase, setMaxPurchase] = useState<number>();

  const [tokenCount, setTokenCount] = useState<number>();
  const [soundSwitch, setSoundSwitch] = useState(true);

  const [play, { pause }] = useSound("/jlo-booty.mp3", {
    volume: 0.03,
    interrupt: true,
    loop: true,
  });

  const playMusic = () => {
    play();
  };

  useEffect(() => {
    if (connected) {
      if (!soundSwitch) {
        pause();
      } else {
        playMusic();
      }
    }
  }, [soundSwitch, pause, play, connected]);

  useEffect(() => {
    const getSupply = async () => {
      try {
        const tokens = await contract.callStatic.totalSupply();
        setTotalSupply(tokens);
      } catch (err) {
        console.log(err, "error in fetch total supply");
      }
    };

    const getInformation = async () => {
      try {
        getSupply();
        const maxSupply = await contract.callStatic.maximumTokens();
        setMaximumTokens(maxSupply);
      } catch (err) {
        console.log(err, "Error in fetching max Supply");
      }
    };

    if (contract) {
      try {
        getInformation();
        setInterval(() => {
          getSupply();
        }, 5000);
      } catch (err) {
        console.log(err);
      }
    }
  }, [contract]);

  useEffect(() => {
    if (user) {
      setConnected(true);
    }
  }, [user]);

  const incrementSupply = (quantity: number) => {
    setTotalSupply(totalSupply + quantity);
  };

  return (
    <div>
      <div className="background">
        <div className="navbar">
          <div className="logo-box">
            <Image src={logo} alt="logo" layout="fill" className="logo" />
          </div>
          <a
            className="twitter-box"
            href="https://twitter.com/BootypixWtf"
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src={twitterLogo}
              alt="logo"
              layout="fill"
              objectFit="contain"
            />
          </a>
          <a
            className="etherscan-box"
            href={getBlockExplorer()}
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src={etherscanLogo}
              alt="logo"
              layout="fill"
              objectFit="contain"
            />
          </a>
          <If
            condition={USE_MUSIC}
            then={
              <div
                className="audio-box"
                onClick={() => setSoundSwitch(!soundSwitch)}
              >
                <Image
                  src={soundSwitch ? soundOn : soundOff}
                  alt="logo"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            }
          />
          {/* <Audio /> */}
        </div>
        <div className="mint-section">
          <If
            condition={!connected}
            then={
              <div className="connect-container">
                <h2 className="signup-text">SIGN UP</h2>
                <div>
                  <h4 className="signup-desc">{MAX_TOKENS} notable (Fe)male artists.</h4>
                  <h4 className="signup-desc">{TOKEN_PRICE} per model. First 1000 = free.</h4>
                </div>
                <ConnectWalletBtn connectWallet={connectWallet} />
                <h4 className="subtext-connect">~ Powered by OnlyLabs ~</h4>
              </div>
            }
            else={
              <If
                condition={SALE_PAUSED}
                then={<OpenseaBtn />}
                else={
                  <div className="supply">
                    <h4
                      className="supply-text"
                      style={{ opacity: totalSupply && maximumTokens ? 1 : 0 }}
                    >{`Tokens Claimed: ${totalSupply}/${maximumTokens}`}</h4>
                    <Mint
                      provider={provider}
                      signer={signer}
                      user={user}
                      incrementSupply={incrementSupply}
                    />
                    <h4
                      className="supply-text"
                      style={{ opacity: totalSupply && maximumTokens ? 1 : 0 }}
                    >{`Connected to: ${condense(user)}`}</h4>
                  </div>
                }
              />
            }
          />
        </div>
      </div>
      <div className="hero-container"></div>
    </div>
  );
};

export default BootyPixPage;
