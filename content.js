/*
 * @Author: MonsterXue
 * @Date: 2022-02-18 17:07:57
 * @LastEditTime: 2022-02-22 18:02:55
 * @LastEditors: MonsterXue
 * @FilePath: \tab-manager\content.js
 * @Description:
 */

let isOpen = false

$(function () {
  let actions = []

  $.get(chrome.runtime.getURL('content.html'), (data) => {
    $(data).appendTo('body')

    chrome.runtime.sendMessage({ request: 'get-actions' }, (response) => {
      actions = response.actions
    })
  })

  const closePanel = () => {
    isOpen = false
    $('.tab-manager-wrap').addClass('tab-manager-closing')
  }

  const openPanel = () => {
    isOpen = true
    $('.tab-manager-wrap').removeClass('tab-manager-closing')
    handleGetPanelList()
  }

  const handleGetPanelList = () => {
    $('.tab-manager-content').html('')

    let panelList = ''
    console.log(actions)
    actions.forEach((tab, index) => {
      panelList += `<div class="tab-manager-item-wrap">
         <div class="tab-manager-item-info">
           <img class="tab-manager-item-icon" src="${
             tab.favIconUrl || chrome.runtime.getURL('assets/Edge.png')
           }" />
           <div class="tab-manager-item">${tab.title}</div>
          </div>
        <div class="tab-manager-tips"></div>
      </div>`
    })
    $('.tab-manager-content').append(panelList)
  }

  chrome.runtime.onMessage.addListener((message, sender, response) => {
    if (message.request == 'icon-click') {
      if (isOpen) {
        closePanel()
      } else {
        openPanel()
      }
    }
  })
})
