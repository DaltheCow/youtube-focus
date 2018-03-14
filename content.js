chrome.runtime.sendMessage({todo: "showPageAction"});

const status = { removed: false, intvl: null };
removeRelatedList(status);

chrome.runtime.onMessage.addListener(data => {
    if (data.action === "watching") {
      clearOldIntvls(status);
      removeRelatedList(status);
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
      while (node.hasChildNodes()) {
        node.removeChild(node.lastChild);
      }
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
