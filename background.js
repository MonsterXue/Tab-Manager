/*
 * @Author: MonsterXue
 * @Date: 2022-02-18 14:30:30
 * @LastEditTime: 2022-02-23 18:26:44
 * @LastEditors: MonsterXue
 * @FilePath: \tab-manager\background.js
 * @Description:
 */

let actions = []

chrome.runtime.onInstalled.addListener(() => {
  // 插件注册
  console.log('install')
  const manifest = chrome.runtime.getManifest()

  const injectIntoTab = (tab) => {
    // tab页中注入脚本
    const scripts = manifest.content_scripts[0].js
    const css = manifest.content_scripts[0].css

    scripts.forEach((script) => {
      tab.url &&
        chrome.scripting.executeScript({
          target: {
            tabId: tab.id
          },
          files: [script]
        })
    })

    css.forEach((style) => {
      tab.url &&
        chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: [style]
        })
    })
  }

  chrome.windows.getAll(
    {
      populate: true
    },
    (windows) => {
      // 获取浏览器所有窗口
      windows.forEach((window) => {
        const { tabs } = window
        tabs.forEach((tab) => {
          const { url } = tab
          // url.startsWith('edge://') && console.log(url)
          !url.startsWith('edge://') &&
            !url.startsWith('chrome://') &&
            injectIntoTab(tab)
        })
      })
    }
  )
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 接收content发送的消息
  console.log(message)
  switch (message.request) {
    case 'get-actions': {
      handleGetActions()
      sendResponse({ actions })
      break
    }
    case 'switch-tab': {
      handleSwitchTab(message.tab)
      break
    }
  }
})

chrome.action.onClicked.addListener((tab) => {
  // 点击插件图标
  chrome.tabs.sendMessage(tab.id, { request: 'icon-click' })
})

chrome.commands.onCommand.addListener((command) => {
  // 监听指令
  console.log('command', command)
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) =>
  handleGetActions()
)
chrome.tabs.onCreated.addListener((tab) => handleGetActions())
chrome.tabs.onRemoved.addListener((tabId, changeInfo) => handleGetActions())

const getAllTabs = () => {
  chrome.tabs.query({}, (tabs) => {
    const allTabs = tabs.map((tab) => ({
      ...tab,
      desc: 'tab',
      action: 'switch-tab'
    }))
    actions = [...allTabs]
  })
}

async function getCurrentTab() {
  // 获取当前tab
  let queryOptions = { active: true, currentWindow: true }
  let [tab] = await chrome.tabs.query(queryOptions)
  return tab
}

const clearActions = () => {
  getCurrentTab().then((tab) => {
    actions = []
  })
}

const handleGetActions = () => {
  // 初始化
  // clearActions()
  getAllTabs()
}

const handleSwitchTab = (tab) => {
  chrome.tabs.highlight({
    tabs: tab.index,
    windowId: tab.windowId
  })
  chrome.windows.update(tab.windowId, { focused: true })
}
