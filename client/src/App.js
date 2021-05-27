import { useMetaMask } from 'metamask-react';
import { useState, useRef } from 'react';
import SimpleStorageContract from './contracts/SimpleStorage.json';
import getWeb3 from './getWeb3';

function App() {
  const { status, connect, account } = useMetaMask();
  const [contract, setContract] = useState(null);
  const [storageValue, setStorageValue] = useState(0);
  const isFirstRender = useRef(true);

  const setStorageTo5 = async () => {
    // Stores a given value, 5 by default.
    await contract.methods.set(5).send({ from: account });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    setStorageValue(response);
  };

  const setWeb3AndContract = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // // Use web3 to get the user's accounts.
      // const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      setContract(instance);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  if (status === 'unavailable') return <div>MetaMask not available :(</div>;

  if (status === 'initializing')
    return <div>Synchronisation with MetaMask ongoing...</div>;

  if (status === 'notConnected')
    return <button onClick={connect}>Connect to MetaMask</button>;

  if (status === 'connecting') return <div>Connecting...</div>;

  if (status === 'connected') {
    if (isFirstRender.current) {
      isFirstRender.current = false; // toggle flag after first render/mounting
      setWeb3AndContract();
    }

    return (
      <>
        <p>storageValue {storageValue}</p>
        <button onClick={setStorageTo5}>set storage to 5</button>
        <div>Connected account: {account}</div>
      </>
    );
  }

  return null;
}

export default App;
