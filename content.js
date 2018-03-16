chrome.runtime.sendMessage({action: "showPageAction"});
chrome.runtime.sendMessage({action: "getState"});
const state = { intvl: null, hideRelated: false, hideComments: false };


chrome.runtime.onMessage.addListener(data => {
    switch(data.action) {
      case "hideField":
      const regex = /https:\/\/www.youtube.com\/watch*/;
        if (regex.test(location.href)) {
          state[data.field] = data.value;
          if (data.value) {
            removeNode(state);
          } else {
            const id = data.field === 'hideRelated' ? 'related' : 'comments';
            const node = document.querySelector(`#${id}`);
            node.style.display = "inline";
          }
        }
    }
});

function removeNode(state) {
  clearInterval(state.intvl);
  const fastIntvl = removeNodeIntvl(100, state);
  state.intvl = fastIntvl;
  setTimeout(() => {
    clearInterval(fastIntvl);
    state.intvl = removeNodeIntvl(1000, state);
  }, 2000);
}

function removeNodeIntvl(intvl, state) {
  const id = setInterval(() => {
    const related = document.querySelector("#related");
    if (related && state.hideRelated) {
      related.style.display = "none";
    }
    const comments = document.querySelector("#comments");
    if (comments && state.hideComments) {
      comments.style.display = "none";
    }
  }, intvl);
  return id;
}
