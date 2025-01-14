import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi';
import contractABI from '../abi/contractABI.json';
import { ethers } from 'ethers';
import { useState } from 'react';

export function Account() {
  const { address, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

  const [recaddress, setrecAddress] = useState("");
  const [ Amounttotransfer, setAmounttotransfer]= useState("");
  const formattedAddress = formatAddress(address);
  const CONTRACT_ADDRESS = "0x9DA011E859A401ef1E39cd2027E609ee00e4AB8D";
  
  const Transfer = async () => {
    const _provider = new ethers.BrowserProvider(window.ethereum);
    const _signer = await _provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, _signer);
    console.log(_provider);
    console.log(_signer);
    console.log(contract);
    try{
      const TokenDecimals = await contract.decimals();
      console.log("TokenDecimals", TokenDecimals);
      let ether = ethers.parseUnits(Amounttotransfer, TokenDecimals);
      console.log("ether", ether);
      const tx = await contract.transfer(recaddress, ether);
      await tx.wait();
    } catch(error){
      console.error("Error fetching TokenDecimals:", error);
    }
  };

  return (
    <div>
      <div className="row">
      <div className="inline">
        {ensAvatar ? (
          <img alt="ENS Avatar" className="avatar" src={ensAvatar} />
        ) : (
          <div className="avatar" />
        )}
        <div className="stack">
          {address && (
            <div className="text">
              {ensName ? `${ensName} (${formattedAddress})` : formattedAddress}
            </div>
          )}
          <div className="subtext">
            Connected to {connector?.name} Connector
          </div>
        </div>
      </div>
      <button className="button" onClick={() => disconnect()} type="button">
        Disconnect
      </button>
      </div>
      <div>
        <p>Address</p>
        <input type="text"
        onChange={(e)=>{setrecAddress(e.target.value); }}
        />
        <p>Amount</p>
        <input type="number"
        onChange={(e)=>{setAmounttotransfer(e.target.value); }}
        />
        <button
            className="bg-red-300 border border-gray-500"
            onClick={Transfer}
          >
            Transfer
        </button>
      </div>
    </div>

    
  );
}

function formatAddress(address?: string) {
  if (!address) return null;
  return `${address.slice(0, 6)}…${address.slice(38, 42)}`;
}