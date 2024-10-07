

document.getElementById('myButton').addEventListener('click', () => {

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTabId = tabs[0].id;
    chrome.tabs.executeScript(
      activeTabId,
      { file: 'content.js' },
      () => { console.log('Content script injected'); }
    );
  });

  chrome.runtime.sendMessage({ action: 'invokeDummy' }, response => {
    if (chrome.runtime.lastError) {
    } else {
    }
  });
});






chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs.length > 0) {
    const activeTabId = tabs[0].id;
    // Inject the content script into the active tab
    chrome.tabs.executeScript(
      activeTabId,
      { file: 'content.js' },
      () => { console.log('Content script injected'); }
    );
  } else {
    console.error('No active tabs found');
  }
});


document.addEventListener('DOMContentLoaded', function () {
  const checkForButtonAndExecute = () => {
    const extractBtn = document.getElementById('myButton');
    // if (extractBtn) {
      // Execute the desired actions as soon as the button is found
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          const activeTabId = tabs[0].id;
          chrome.tabs.executeScript(
            activeTabId,
            { file: 'content.js' },
            () => { console.log('Content script injected'); }
          );
        } else {
          console.error('No active tabs found');
        }
      });

  };

  // Check immediately if the button is already present on the initial load
  checkForButtonAndExecute();

  // Observe the body for any changes to ensure the button is found if added later
  const observeDOM = (function() {
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    return function(obj, callback) {
      if (!obj || obj.nodeType !== 1) return;

      if (MutationObserver) {
        const mutationObserver = new MutationObserver(callback);
        mutationObserver.observe(obj, { childList: true, subtree: true });
        return mutationObserver;
      }
    };
  })();

  observeDOM(document.body, function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1 && node.id === 'myButton') {
          checkForButtonAndExecute();
        }
      });
    });
  });
});
