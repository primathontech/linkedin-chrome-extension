document.addEventListener("DOMContentLoaded", function () {
  const extractBtn = document.getElementById("myButton");
  const organizationIdInput = document.getElementById("organizationId");
  const statusMessage = document.getElementById("status-message");

  // Load stored organization ID and loader state when popup opens
  loadStoredData();

  if (extractBtn) {
    extractBtn.addEventListener("click", () => {
      const organizationId = organizationIdInput.value;
      console.log(organizationId, "sdfwf popup");

      saveOrganizationId(organizationId);
      setLoaderState(true);

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          const activeTabId = tabs[0].id;
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

      chrome.runtime.sendMessage(
        { action: "invokeDummy", data: organizationId },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Runtime error:", chrome.runtime.lastError);
            setLoaderState(false, "Error occurred. Please try again.");
          } else {
            console.log("Background script response:", response);
          }
        }
      );
    });
  } else {
    console.error("Button not found");
  }

  function setLoaderState(isLoading, message = "Processing...") {
    chrome.storage.local.set({ isLoading: isLoading, statusMessage: message }, function() {
      updateLoaderUI(isLoading, message);
    });
  }

  function updateLoaderUI(isLoading, message) {
    const loader = document.getElementById("loader");
    loader.style.display = isLoading ? "flex" : "none";
    statusMessage.textContent = message;
    extractBtn.disabled = isLoading;
  }

  function loadStoredData() {
    chrome.storage.sync.get(['organizationId'], function(result) {
      if (result.organizationId) {
        organizationIdInput.value = result.organizationId;
      }
    });

    chrome.storage.local.get(['isLoading', 'statusMessage'], function(result) {
      updateLoaderUI(result.isLoading, result.statusMessage || "Processing...");
    });
  }

  function saveOrganizationId(id) {
    chrome.storage.sync.set({organizationId: id}, function() {
      console.log('Organization ID saved');
    });
  }

  organizationIdInput.addEventListener('input', function() {
    saveOrganizationId(this.value);
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateLoader") {
      setLoaderState(request.isLoading, request.message);
    }
  });
});