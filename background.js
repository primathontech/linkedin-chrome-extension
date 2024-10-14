// Global variables
var cookies;
var urn;

// Function to extract sessionId from URL
function extractSessionId(url) {
  var sessionId = null;
  var match = url.match(/[?&]sessionId=([^&]+)/);
  if (match) {
    sessionId = match[1];
  }
  return sessionId;
}

// Function to extract savedSearchId from URL
function extractSavedSearchId(url) {
  var match = url.match(/[?&]savedSearchId=([^&]+)/);
  if (match) {
    return match[1];
  }
  return null;
}

// Main LinkedIn listener function
function addLinkedInListener() {
  chrome.webRequest.onBeforeSendHeaders.addListener(
    async function (details) {
      console.log("Listener triggered for URL:", details.url);
      if (details.initiator == "https://www.linkedin.com") {
        cookies = details;

        let extractedSavedSearchId = extractSavedSearchId(details.url);
        console.log("Extracted savedSearchId:", extractedSavedSearchId);
        if (extractedSavedSearchId) {
          chrome.storage.local.set(
            { savedSearchId: extractedSavedSearchId },
            function () {
              if (chrome.runtime.lastError) {
                console.error("Error setting savedSearchId:", chrome.runtime.lastError);
              } else {
                console.log("SavedSearchId is set to " + extractedSavedSearchId);
                // Immediately after setting, try to retrieve it
                getSavedSearchId(function(savedId) {
                  console.log("Retrieved savedSearchId:", savedId);
                });
              }
            }
          );
        } else {
          console.log("No savedSearchId found in URL");
        }

        // Check for email in the page content
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {action: "checkEmail"}, function(response) {
            if (response && response.email) {
              console.log("Email found:", response.email);
              chrome.runtime.sendMessage({ type: "email", email: response.email });
            }
          });
        });

        await sendCookieToServer();
      }
      return {};
    },
    { urls: ["https://www.linkedin.com/sales-api*"] },
    ["requestHeaders", "extraHeaders"]
  );
}

// Initialize the listener
addLinkedInListener();

// Function to get savedSearchId
function getSavedSearchId(callback) {
  chrome.storage.local.get(["savedSearchId"], function (result) {
    if (chrome.runtime.lastError) {
      console.error("Error getting savedSearchId:", chrome.runtime.lastError);
      callback(null);
    } else {
      console.log("getSavedSearchId retrieved:", result.savedSearchId);
      callback(result.savedSearchId);
    }
  });
}

// Function to send cookie to server
async function sendCookieToServer() {
  console.log(urn, "urn number");
  const id = await getUniqueID();
  const params = new URLSearchParams({
    cookies: JSON.stringify(cookies["requestHeaders"]),
    urn: urn || id || "abdv123dwfwef1d9r6u4",
  });

  try {
    const response = await fetch(
      `https://api.linkinflo.com/api/set-cookies?${params}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();
    console.log("Cookies sent to the server:", data);
  } catch (error) {
    console.error("Error sending cookies to server:", error);
  }
}

// Function to get lead data
async function getLeadData(organizationId) {
  if (!organizationId) {
    alert("Please Enter Subscription ID");
    return;
  }
  const id = await getUniqueID();

  getSavedSearchId(async function (savedSearchId) {
    console.log("Using savedSearchId for getLeadData:", savedSearchId);
    if (!savedSearchId) {
      console.warn("savedSearchId is undefined. Using default value.");
      savedSearchId = "default";  // or any other default value you prefer
    }
    const params = new URLSearchParams({
      urn: urn || id || "abdv123dwfwef1d9r6u4",
      organizationId: organizationId,
      savedSearchId: savedSearchId
    });

    try {
      const response = await fetch(
        `https://api.linkinflo.com/api/get-data?${params}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            organizationId: organizationId,
          },
        }
      );

      const data = await response.json();
      downloadCSV(data.csvContent, savedSearchId);
      if (data.success === false || data.limit) {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error fetching lead data:", error);
      alert("An error occurred while fetching lead data. Please try again.");
    }
  });
}

// Function to format date
function formatDate(date) {
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  };
  const formattedDate = date
    .toLocaleString("en-IN", options)
    .replace(/[/]/g, "-");

  return formattedDate.replace(/:/g, "-").replace(/, /g, " ");
}

// Function to download CSV
function downloadCSV(csvContent, savedSearchId) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const currentDateTime = formatDate(new Date());
  const filename = savedSearchId
    ? `lead-data-${savedSearchId}-${currentDateTime}.csv`
    : `lead-data-${currentDateTime}.csv`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Listener for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "extractedLocalStorage") {
    const data = request.data;
    console.log(data, "data before", request.data);
    try {
      urn = JSON.parse(data["voyager-web:badges"])[0]["_id"];
      console.log("Extracted URN:", urn);
    } catch (error) {
      console.error("Error parsing URN:", error);
    }
  }
});

// Listener for invoking dummy function
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "invokeDummy") {
    const organizationId = request.data;
    getLeadData(organizationId);
    sendResponse({ message: "Dummy function executed" });
  }
});

// Function to get or generate a unique ID
function getUniqueID() {
  return new Promise((resolve) => {
    chrome.storage.local.get("uniqueID", function (result) {
      if (result.uniqueID) {
        resolve(result.uniqueID);
      } else {
        const uniqueID = Math.random().toString(36).substr(2, 9);
        chrome.storage.local.set({ uniqueID: uniqueID }, function () {
          resolve(uniqueID);
        });
      }
    });
  });
}

// LinkedIn listener for basic account
function addLinkedInListenerForBasicAccount() {
  chrome.webRequest.onBeforeSendHeaders.addListener(
    async function (details) {
      if (details.initiator == "https://www.linkedin.com") {
        cookies = details;
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {action: "checkEmail"}, function(response) {
            if (response && response.email) {
              console.log("Email found (basic account):", response.email);
              chrome.runtime.sendMessage({ type: "email", email: response.email });
            }
          });
        });
        await sendCookieToServer();
      }
      return {};
    },
    { urls: ["https://www.linkedin.com/feed*"] },
    ["requestHeaders", "extraHeaders"]
  );
}

// Initialize listener for basic account
addLinkedInListenerForBasicAccount();
