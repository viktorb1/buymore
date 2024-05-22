const getChromeStorage = async (key: string) => {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], function (result) {
          resolve(result[key]);
      });
    });
  };

  const setChromeStorage = async (key: string, value: any) => {
    return new Promise((resolve) => {
      const data = {[key]: value};
      chrome.storage.local.set(data, () => { resolve(true)});
    });
  };
  

  export { getChromeStorage, setChromeStorage}