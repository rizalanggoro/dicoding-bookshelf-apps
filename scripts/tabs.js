const tabListEl = document.querySelector("tab-list");
const tabContentEl = document.querySelector("tab-content");

const renderTabContent = () => {
  const defaultValue = tabListEl.getAttribute("default-value");

  tabListEl.querySelectorAll("button").forEach((item) => {
    if (item.getAttribute("value") === defaultValue) {
      item.classList.add("tab-list-item-selected");
    } else {
      item.classList.remove("tab-list-item-selected");
    }
  });

  tabContentEl.querySelectorAll("section[value]").forEach((content) => {
    if (content.getAttribute("value") === defaultValue) {
      content.classList.remove("hidden");
    } else {
      content.classList.add("hidden");
    }
  });
};

// tab item event
tabListEl.querySelectorAll("button").forEach((item) => {
  item.addEventListener("click", () => {
    const value = item.getAttribute("value");
    tabListEl.setAttribute("default-value", value);
    renderTabContent();
  });
});

renderTabContent();
