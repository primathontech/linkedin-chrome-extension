// Function to extract data from the webpage's localStorage
function extractWebpageLocalStorageData() {
    let data = {};
  
    // Iterate through localStorage to extract data
    for (let i = 0; i < localStorage.length; i++) {
      let key = localStorage.key(i);
      let value = localStorage.getItem(key);
      data[key] = value;
    }
  
    return data;
  }
  
  // Extract data and send it to the background script
  const localStorageData = extractWebpageLocalStorageData();
  chrome.runtime.sendMessage({ type: 'extractedLocalStorage', data: localStorageData });
  