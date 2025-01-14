import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from "wagmi";
import contractABI from "../abi/contractABI.json";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Contract } from "ethers";

export function Account() {
  const { address, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName! });

  const formattedAddress = formatAddress(address);

  const CONTRACT_ADDRESS = "0x9DA011E859A401ef1E39cd2027E609ee00e4AB8D";
  const [recaddress, setrecAddress] = useState("");
  const [recbalance, setrecbalance] = useState("");
  const [ownerbalance, setownerbalance] = useState("");
  const [Amounttotransfer, setAmounttotransfer] = useState("");
  const [contract, setContract] = useState<Contract>();
  const [amounttoapprove, setamounttoapprove] = useState("");
  const [approvedamount, setapprovedAmount] = useState("");
  const [decimals, setdecimals] = useState(0);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const _provider = new ethers.BrowserProvider(window.ethereum);
    const _signer = await _provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractABI,
      _signer
    );
    setContract(contract);
    const TokenDecimals = await contract.decimals();
    console.log("TokenDecimals", TokenDecimals);
    setdecimals(TokenDecimals);
  };

  const checkbalance = async () => {
    try {
      if (contract) {
        const recbalance = await contract.balanceOf(recaddress);
        const ownerbalance = await contract.balanceOf(address);
        const parsedBalance = ethers.formatUnits(ownerbalance, decimals);
        setownerbalance(parsedBalance);
        console.log("ownerbalance", ownerbalance);
        console.log("recbalance", recbalance);
        const parsedAmount = ethers.formatUnits(recbalance, decimals);
        setrecbalance(parsedAmount);
      }
    } catch (error) {
      console.error("Error checking balance:", error);
    }
  };

  const Transfer = async () => {
    try {
      if (contract) {
        let ether = ethers.parseUnits(Amounttotransfer, decimals);
        console.log("ether", ether);
        const tx = await contract.transfer(recaddress, ether);
        await tx.wait();
      }
    } catch (error) {
      console.error("Error fetching TokenDecimals:", error);
    }
  };

  const Approve = async () => {
    if (contract) {
      let ether = ethers.parseUnits(amounttoapprove, decimals);
      console.log("amounttoapprove", amounttoapprove);
      const tx = await contract.approve(recaddress, ether);
      await tx.wait();
    }
  };

  const allowedamount = async () => {
    if (contract) {
      const approvedAmount = await contract.allowance(address, recaddress);
      console.log("approvedAmount", approvedAmount);
      const parsedAmount = ethers.formatUnits(approvedAmount, decimals);
      setapprovedAmount(parsedAmount);
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
                {ensName
                  ? `${ensName} (${formattedAddress})`
                  : formattedAddress}
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
        <p>{ownerbalance}</p>
        <p>Address</p>
        <input
          type="text"
          onChange={(e) => {
            setrecAddress(e.target.value);
          }}
        />
        <button onClick={checkbalance}>checkbalance</button>
        <p>{recbalance}</p>
        <p>TransferAmount</p>
        <input
          type="number"
          onChange={(e) => {
            setAmounttotransfer(e.target.value);
          }}
        />
        <button
          className="bg-red-300 border border-gray-500"
          onClick={Transfer}
        >
          Transfer
        </button>
      </div>

      <div>
        <p>amount to approve</p>
        <input
          type="number"
          onChange={(e) => {
            setamounttoapprove(e.target.value);
          }}
        />
        <p>{amounttoapprove}</p>
        <button onClick={Approve}>Approve</button>
      </div>

      <div>
        <p>allowed amount</p>
        <button onClick={allowedamount}>checkallowance</button>
        <p>{approvedamount}</p>
      </div>
    </div>
  );
}

function formatAddress(address?: string) {
  if (!address) return null;
  return `${address.slice(0, 6)}…${address.slice(38, 42)}`;
}
