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
