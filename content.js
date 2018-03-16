
chrome.runtime.sendMessage({action: "showPageAction"});
chrome.runtime.sendMessage({action: "getState"})
const status = { removed: false, intvl: null };


chrome.runtime.onMessage.addListener(data => {
    switch(data.action) {
      case "watching":
        clearOldIntvls(status);
        removeRelatedList(status);
        break;
      case "hideRelated":
        if (data.value) {
          clearOldIntvls(status);
          removeRelatedList(status)
          console.log("hihi");
        } else {
          clearOldIntvls(status);
          console.log("hi");
          const node = document.querySelector("#related");
          node.style.display = "inline";
        }
    }
});

function removeRelatedList(status) {
  const fastIntvl = removeRelatedIntvl(100, status);
  status.intvl = fastIntvl;
  setTimeout(() => {
    if (!status.removed) {
      clearInterval(fastIntvl);
      status.intvl = removeRelatedIntvl(1000, status);
    }
  }, 2000);
}

function removeRelatedIntvl(intvl, status) {
  const id = setInterval(() => {
    const node = document.querySelector("#related");
    if (node) {
      status.removed = true;
      node.style.display = "none";
      clearInterval(id);
    }
  }, intvl);
  return id;
}

function clearOldIntvls(status) {
  if (!status.removed) {
    clearInterval(status.intvl);
    status.removed = false;
  }
}
