// document.getElementById('myButton').addEventListener('click', () => {

//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     const activeTabId = tabs[0].id;
//     chrome.tabs.executeScript(
//       activeTabId,
//       { file: 'content.js' },
//       () => { console.log('Content script injected'); }
//     );
//   });

//   chrome.runtime.sendMessage({ action: 'invokeDummy' }, response => {
//     if (chrome.runtime.lastError) {
//     } else {
//     }
//   });
// });

// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//   if (tabs.length > 0) {
//     const activeTabId = tabs[0].id;
//     // Inject the content script into the active tab
//     chrome.tabs.executeScript(
//       activeTabId,
//       { file: 'content.js' },
//       () => { console.log('Content script injected'); }
//     );
//   } else {
//     console.error('No active tabs found');
//   }
// });

// document.addEventListener('DOMContentLoaded', function () {
//   const checkForButtonAndExecute = () => {
//     const extractBtn = document.getElementById('myButton');
//     // if (extractBtn) {
//       // Execute the desired actions as soon as the button is found
//       chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//         if (tabs.length > 0) {
//           const activeTabId = tabs[0].id;
//           chrome.tabs.executeScript(
//             activeTabId,
//             { file: 'content.js' },
//             () => { console.log('Content script injected'); }
//           );
//         } else {
//           console.error('No active tabs found');
//         }
//       });

//   };

//   // Check immediately if the button is already present on the initial load
//   checkForButtonAndExecute();

//   // Observe the body for any changes to ensure the button is found if added later
//   const observeDOM = (function() {
//     const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

//     return function(obj, callback) {
//       if (!obj || obj.nodeType !== 1) return;

//       if (MutationObserver) {
//         const mutationObserver = new MutationObserver(callback);
//         mutationObserver.observe(obj, { childList: true, subtree: true });
//         return mutationObserver;
//       }
//     };
//   })();

//   observeDOM(document.body, function(mutations) {
//     mutations.forEach(function(mutation) {
//       mutation.addedNodes.forEach(function(node) {
//         if (node.nodeType === 1 && node.id === 'myButton') {
//           checkForButtonAndExecute();
//         }
//       });
//     });
//   });
// });

document.addEventListener("DOMContentLoaded", function () {
  const extractBtn = document.getElementById("myButton");

  if (extractBtn) {
    extractBtn.addEventListener("click", () => {
      // Get the value from the input field
      const organizationId = document.getElementById("organizationId").value;
      console.log(organizationId, "sdfwf popup");

      // Query the active tab in the current window
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          const activeTabId = tabs[0].id;

          // Inject content script into the active tab
          chrome.scripting.executeScript(
            {
              target: { tabId: activeTabId },
              files: ["content.js"],
            },
            () => {
              console.log("Content script injected");
            }
          );
        } else {
          console.error("No active tabs found");
        }
      });

      // Send a message to the background script
      chrome.runtime.sendMessage(
        { action: "invokeDummy", data: organizationId },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Runtime error:", chrome.runtime.lastError);
          } else {
            console.log("Background script response:", response);
          }
        }
      );
    });
  } else {
    console.error("Button not found");
  }
});
