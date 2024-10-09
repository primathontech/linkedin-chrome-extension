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

// 1 first
// var cookies;
// var urn;

// function extractSessionId(url) {
//   var sessionId = null;
//   var match = url.match(/[?&]sessionId=([^&]+)/);
//   if (match) {
//     sessionId = match[1];
//   }
//   return sessionId;
// }
// function addLinkedInListener() {
//   chrome.webRequest.onBeforeSendHeaders.addListener(
//     async function (details) {
//       if (details["initiator"] == "https://www.linkedin.com") {
//         cookies = details;
//         // Check if the email ID is visible on the page
//         const emailElement = document.querySelector(
//           ".ci-email .pv-contact-info__contact-item"
//         );

//         if (emailElement) {
//           const email = emailElement.innerText;
//           chrome.runtime.sendMessage({ type: "email", email: email });
//         }
//         // getProfileURL()
//         sendCookieToServer();
//       }
//       return {};
//     },
//     { urls: ["https://www.linkedin.com/sales-api*"] },
//     ["requestHeaders", "extraHeaders"]
//   );
// }

// addLinkedInListener();

// async function sendCookieToServer() {
//   const params = new URLSearchParams({
//     cookies: JSON.stringify(cookies["requestHeaders"]),
//     urn: urn,
//   });
//   const response = await fetch(
//     `http://localhost:3000/api/set-cookies?${params}`,
//     {
//       method: "GET",
//     }
//   );

//   const data = await response.json(); // or response.text() for plain text
// }

// async function getLeadData(organizationId) {
//   // const response = await fetch(
//   //   `http://localhost:3000/api/organization/${organizationId}`,
//   //   {
//   //     method: "GET",
//   //     headers: {
//   //       "Content-Type": "application/json", // Set content type
//   //       organizationId: organizationId, // Example for setting an authorization token
//   //     },
//   //   }
//   // );
//   // const data = await response.json();

//   const params = new URLSearchParams({
//     urn: urn,
//     organizationId: organizationId,
//   });
//   const response = await fetch(`http://localhost:3000/api/get-data?${params}`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json", // Set content type
//       organizationId: organizationId, // Example for setting an authorization token
//     },
//   });

//   const data = await response.json(); // or response.text() for plain text

//   // const params = new URLSearchParams({
//   //   urn:urn });
//   // const response = await fetch(`http://localhost:3000/api/get-data?${params}`, {
//   //   method: 'GET',
//   // });

//   // const data = await response.json(); // or response.text() for plain text
// }

// function getProfileURL() {
//   const profileURL = document.querySelector(
//     "a[href*='https://www.linkedin.com/sales/search/']"
//   ).href;
//   if (profileURL) {
//     chrome.runtime.sendMessage({ type: "profileURL", profileURL: profileURL });
//   } else {
//   }
// }

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === "invokeDummy") {
//     const organizationId = request.data;
//     getLeadData(organizationId);
//     sendResponse({ message: "Dummy function executed" });
//   }
// });

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === "extractedLocalStorage") {
//     const data = request.data;
//     urn = JSON.parse(data["voyager-web:badges"])[0]["_id"];
//   }
// });

// console.log(urn, "urn ==============");

// function addLinkedInListenerForBasicAccount() {
//   chrome.webRequest.onBeforeSendHeaders.addListener(
//     async function (details) {
//       if (details["initiator"] == "https://www.linkedin.com") {
//         cookies = details;
//         const emailElement = document.querySelector(
//           ".ci-email .pv-contact-info__contact-item"
//         );

//         if (emailElement) {
//           const email = emailElement.innerText;
//           chrome.runtime.sendMessage({ type: "email", email: email });
//         }
//         // getProfileURL()
//         sendCookieToServer();
//       }
//       return {};
//     },
//     { urls: ["https://www.linkedin.com/feed*"] },
//     ["requestHeaders", "extraHeaders"]
//   );
// }

// addLinkedInListenerForBasicAccount();

//2 -   second
// var cookies;
// var urn;

// // Function to extract the sessionId from the URL
// function extractSessionId(url) {
//   var sessionId = null;
//   var match = url.match(/[?&]sessionId=([^&]+)/);
//   if (match) {
//     sessionId = match[1];
//   }
//   return sessionId;
// }

// // Function to listen to LinkedIn requests and handle cookies
// function addLinkedInListener() {
//   chrome.webRequest.onBeforeSendHeaders.addListener(
//     async function (details) {
//       if (details.initiator === "https://www.linkedin.com") {
//         cookies = details;
//         // Send cookies to server
//         sendCookieToServer();
//       }
//       return {};
//     },
//     { urls: ["https://www.linkedin.com/sales-api*"] },
//     ["requestHeaders", "extraHeaders"]
//   );
// }

// addLinkedInListener();

// async function sendCookieToServer() {
//   const params = new URLSearchParams({
//     cookies: JSON.stringify(cookies.requestHeaders),
//     urn: urn,
//   });
//   const response = await fetch(
//     `http://localhost:3000/api/set-cookies?${params}`,
//     {
//       method: "GET",
//     }
//   );
//   const data = await response.json();
// }

// async function getLeadData(inputData) {
//   // Make a dummy API call with the input data as a parameter
//   const res = await fetch(
//     `http://localhost:3000/api/dummy?inputData=${inputData}`,
//     {
//       method: "GET",
//     }
//   );
//   const data = await res.json();
//   return data;
// }

// // Message listener to invoke dummy function with input data
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.action === "invokeDummy") {
//     const inputData = request.data; // Get the input data from the request

//     getLeadData(inputData).then((data) => {
//       console.log("Lead data retrieved:", data);
//       sendResponse({ message: "Dummy function executed", data: data });
//     });
//     return true; // Keep the message channel open for async response
//   }
// });
