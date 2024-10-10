var cookies;
var urn;

function extractSessionId(url) {
  var sessionId = null;
  var match = url.match(/[?&]sessionId=([^&]+)/);
  if (match) {
    sessionId = match[1];
  }
  return sessionId;
}

function addLinkedInListener() {
  chrome.webRequest.onBeforeSendHeaders.addListener(
    async function (details) {
      if (details.initiator == "https://www.linkedin.com") {
        cookies = details;

        // Check if the email ID is visible on the page (email extraction is handled in content script)
        const emailElement = document.querySelector(
          ".ci-email .pv-contact-info__contact-item"
        );

        if (emailElement) {
          const email = emailElement.innerText;
          chrome.runtime.sendMessage({ type: "email", email: email });
        }
        sendCookieToServer(); // Send cookies to the server
      }
      return {};
    },
    { urls: ["https://www.linkedin.com/sales-api*"] },
    ["requestHeaders", "extraHeaders"]
  );
}

addLinkedInListener();

async function sendCookieToServer() {
  const params = new URLSearchParams({
    cookies: JSON.stringify(cookies["requestHeaders"]),
    urn: urn,
  });

  const response = await fetch(
    `http://localhost:3000/api/set-cookies?${params}`,
    {
      method: "GET",
    }
  );

  const data = await response.json();
  console.log("Cookies sent to the server:", data);
}

async function getLeadData(organizationId) {
  if (!organizationId) {
    alert("Please enter organizationId");
    return;
  }
  console.log(organizationId, "orign");

  const params = new URLSearchParams({
    urn: urn,
    organizationId: organizationId,
  });

  const response = await fetch(`http://localhost:3000/api/get-data?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      organizationId: organizationId,
    },
  });

  const data = await response.json();
  console.log("Lead data:", data);
}

// Listener to get `urn` from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "extractedLocalStorage") {
    const data = request.data;
    urn = JSON.parse(data["voyager-web:badges"])[0]["_id"];
    console.log("Extracted URN:", urn);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "invokeDummy") {
    const organizationId = request.data;
    getLeadData(organizationId);
    sendResponse({ message: "Dummy function executed" });
  }
});

function addLinkedInListenerForBasicAccount() {
  chrome.webRequest.onBeforeSendHeaders.addListener(
    async function (details) {
      if (details.initiator == "https://www.linkedin.com") {
        cookies = details;
        const emailElement = document.querySelector(
          ".ci-email .pv-contact-info__contact-item"
        );

        if (emailElement) {
          const email = emailElement.innerText;
          chrome.runtime.sendMessage({ type: "email", email: email });
        }
        sendCookieToServer(); // Send cookies to the server
      }
      return {};
    },
    { urls: ["https://www.linkedin.com/feed*"] },
    ["requestHeaders", "extraHeaders"]
  );
}

addLinkedInListenerForBasicAccount();
