

export async function etherEvent() {

    if (typeof ethereum === 'undefined' || ethereum === null) {
      alert("need an etheruem wallet to donate.\nYou can also send donations to adress 0x8D1f21f298632daF4055c955163d3885EB9e962f");
    }

    let account;
    let donation_amount = 0;

    await ethereum.request({method: 'eth_requestAccounts'}).then(async accounts =>{
      account = accounts[0];
      donation_amount = document.getElementById('donation-amount').value;
      console.log(account);

      await ethereum.request({method: 'eth_getBalance', params: [account, 'latest']}).then(result => {
        let wei = parseInt(result, 16);
        let balance = wei/(10**18);
        console.log(balance + "ETH");
      });

    });

    if (donation_amount === 0) {
      alert("you cannot donate 0 ETH");
      return;
    }
    
    console.log(('0x' + donation_amount*(10**18)).toString(16));
    let transactionParam = {
      to: '0x8D1f21f298632daF4055c955163d3885EB9e962f',
      from: account,
      value: '0x' + (donation_amount*(1000000000000000000)).toString(16)
    };

    ethereum.request({method: 'eth_sendTransaction', params:[transactionParam]}).then(txhash => {
      alert("Awaiting transaction, You will be notified when transaction is complete");

      getTxConfirmation(txhash).then(message => {
        alert(message);
      });

    });
  }

  function getTxConfirmation(txhash) {
    
    let getReceipt = () => {
      return ethereum.request({method: 'eth_getTransactionReceipt', params:[txhash]}).then(confirmation => {
          if (confirmation !== null) {
            return 'confirmed';
          }
          else return getReceipt(txhash);
      });
    }
    return getReceipt();
  }