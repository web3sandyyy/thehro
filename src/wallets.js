// EIP-6963 supports multiple extensions and injected mobile-wallet browsers.
// No third-party wallet scripts or private keys are loaded by the app.
export function discoverWallets(host=window) {
  const providers=new Map();
  const announce=event=>{
    const {info,provider}=event.detail??{};
    if(provider&&typeof provider.request==='function'&&typeof info?.uuid==='string')providers.set(info.uuid,{id:info.uuid,name:String(info.name??'Browser wallet').slice(0,80),icon:typeof info.icon==='string'&&info.icon.startsWith('data:image/')?info.icon:null,provider});
  };
  host.addEventListener('eip6963:announceProvider',announce);
  host.dispatchEvent(new Event('eip6963:requestProvider'));
  return {
    list(){
      const list=[...providers.values()];
      if(host.ethereum&&!list.some(p=>p.provider===host.ethereum))list.push({id:'injected',name:'Browser wallet',icon:null,provider:host.ethereum});
      return list;
    },
    dispose(){host.removeEventListener('eip6963:announceProvider',announce);},
  };
}

export function isMobile(nav=globalThis.navigator) {
  return /Android|iPhone|iPad|iPod/i.test(nav?.userAgent??'');
}

// Deep links open the current page inside each wallet's in-app browser, which injects a provider.
export function mobileWalletLinks({href,host,pathname,search=''}) {
  const url=encodeURIComponent(href);
  return [
    {name:'MetaMask',href:`https://metamask.app.link/dapp/${host}${pathname}${search}`},
    {name:'Coinbase Wallet',href:`https://go.cb-w.com/dapp?cb_url=${url}`},
    {name:'Trust Wallet',href:`https://link.trustwallet.com/open_url?coin_id=60&url=${url}`},
  ];
}
