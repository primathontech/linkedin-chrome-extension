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
  console.log(urn, "urn number");

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
  downloadCSV(data.csvContent);
  if (data.success === false || data.limit) {
    alert(data.message);
  }
}

function formatDate(date) {
  // Create an options object for date formatting
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, 
  };
  const istDate = new Date(
    date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  );
  const formattedDate = istDate
    .toLocaleString("en-IN", options)
    .replace(/[/]/g, "-");

  return formattedDate.replace(/:/g, "-").replace(/, /g, " ");
}

function downloadCSV(csvContent) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const currentDateTime = formatDate(new Date());
  const filename = `lead-data-${currentDateTime}.csv`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Listener to get `urn` from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "extractedLocalStorage") {
    const data = request.data;

    console.log(data, "data before", request.data);

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
