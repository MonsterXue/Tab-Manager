/*
 * @Author: MonsterXue
 * @Date: 2022-02-18 14:30:30
 * @LastEditTime: 2022-02-21 17:21:19
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

chrome.action.onClicked.addListener((tab) => {
  // 点击插件图标
  console.log(tab)
})

chrome.commands.onCommand.addListener((command) => {
  // 监听指令
  console.log('command', command)
  getCurrentTab().then((tab) => {
    console.log('curTab', tab)
  })
  getAllTabs()
})

const getAllTabs = () => {
  chrome.tabs.query({}, (tabs) => {
    console.log('allTabs', tabs)
  })
}

async function getCurrentTab() {
  // 获取当前tab
  let queryOptions = { active: true, currentWindow: true }
  let [tab] = await chrome.tabs.query(queryOptions)
  return tab
}
