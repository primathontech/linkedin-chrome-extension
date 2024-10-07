
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
    if(details["initiator"]=="https://www.linkedin.com"){
      cookies = details;
      // Check if the email ID is visible on the page
      const emailElement = document.querySelector(".ci-email .pv-contact-info__contact-item");

      if (emailElement) {
        const email = emailElement.innerText;
        chrome.runtime.sendMessage({ type: "email", email: email });
      }
    // getProfileURL()
   sendCookieToServer()
        
    }
    return {};
  },
  { urls: ["https://www.linkedin.com/sales-api*"] }, ['requestHeaders', 'extraHeaders']
);
}   

addLinkedInListener();

async function sendCookieToServer(){
  const params = new URLSearchParams({
    cookies:JSON.stringify(cookies['requestHeaders']),
    urn:urn
  });
  const response = await fetch(`http://localhost:3000/api/set-cookies?${params}`, {
    method: 'GET',
  });
  
  const data = await response.json(); // or response.text() for plain text
}


async function getLeadData(){

  const params = new URLSearchParams({
    urn:urn });
  const response = await fetch(`http://localhost:3000/api/get-data?${params}`, {
    method: 'GET',
  });
  
  const data = await response.json(); // or response.text() for plain text
}


function getProfileURL() {
  const profileURL = document.querySelector("a[href*='https://www.linkedin.com/sales/search/']").href;
  if (profileURL) {
    chrome.runtime.sendMessage({ type: "profileURL", profileURL: profileURL });
  } else {
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'invokeDummy') {  
    getLeadData();
    sendResponse({ message: 'Dummy function executed' });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'extractedLocalStorage') {
    const data = request.data;
    urn = JSON.parse(data["voyager-web:badges"])[0]["_id"]
  }
});



function addLinkedInListenerForBasicAccount() {
chrome.webRequest.onBeforeSendHeaders.addListener(

  async function (details) {
    if(details["initiator"]=="https://www.linkedin.com"){
      cookies = details;
      const emailElement = document.querySelector(".ci-email .pv-contact-info__contact-item");

      if (emailElement) {
        const email = emailElement.innerText;
        chrome.runtime.sendMessage({ type: "email", email: email });
      }
    // getProfileURL()
   sendCookieToServer()
        
    }
    return {};
  },
  { urls: ["https://www.linkedin.com/feed*"] }, ['requestHeaders', 'extraHeaders']
);
} 

addLinkedInListenerForBasicAccount()