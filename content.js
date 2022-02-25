/*
 * @Author: MonsterXue
 * @Date: 2022-02-18 17:07:57
 * @LastEditTime: 2022-02-25 17:17:18
 * @LastEditors: MonsterXue
 * @FilePath: \tab-manager\content.js
 * @Description:
 */

let isOpen = false
let keyMap = {}

$(function () {
  let actions = []

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

  const injectPanelDom = () => {
    const template = `<div class="tab-manager-wrap tab-manager-closing">
      <div class="tab-manager-dialog"></div>
      <div id="tab-manager">
        <div class="tab-manager-head">
          <input placeholder="请输入关键字" />
        </div>
        <div class="tab-manager-content"></div>
      <div class="tab-manager-footer">Made by MonsterXue</div>
      </div>
    </div>`
    $('body').append(template)
  }

  const closePanel = () => {
    isOpen = false
    $('.tab-manager-wrap').addClass('tab-manager-closing')
  }

  const openPanel = async () => {
    await handleGetActions()
    isOpen = true
    $('.tab-manager-wrap').removeClass('tab-manager-closing')
    $('.tab-manager-head input').val('')
    getPanelList()
    setTimeout(() => {
      $('.tab-manager-head input').focus()
    }, 50)
  }

  const getPanelList = (panelActions = actions) => {
    $('.tab-manager-content').html('')
    panelActions.forEach((tab, index) => {
      let panelList = ''
      const img = new Image()
      img.src = tab.favIconUrl
      img.className = 'tab-manager-item-icon'
      $(img).attr(`data-img-ind`, index)
      img.onerror = () => {
        img.src = chrome.runtime.getURL('assets/Edge.png')
        $(`.tab-manager-item-icon[data-img-ind=${index}]`).attr(
          'src',
          chrome.runtime.getURL('assets/Edge.png')
        )
      }
      panelList += `<div class="tab-manager-item-wrap" data-ind=${index} data-tab=${tab.id}>
          <div class="tab-manager-item-info">
           ${img.outerHTML}
           <div class="tab-manager-item">${tab.title}</div>
          </div>
          <div class="tab-manager-tips"></div>
        </div>`
      $('.tab-manager-content').append(panelList)
    })
    initDomEvent()
  }

  const initDomEvent = () => {
    $('.tab-manager-item-wrap').click(function () {
      const ind = $(this).attr('data-ind')
      handleAction(ind)
      closePanel()
    })

    $('.tab-manager-item-wrap').mouseover(function () {
      $('.tab-manager-item-active').removeClass('tab-manager-item-active')
      $(this).addClass('tab-manager-item-active')
    })
  }

  const handleAction = (ind) => {
    const action = actions[ind]
    chrome.runtime.sendMessage({
      request: action.action,
      tab: action
    })
  }

  const handleGetActions = () => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ request: 'get-actions' }, (response) => {
        actions = response.actions
        resolve(response)
      })
    })
  }

  const handleArrowUp = () => {
    // arrowup
    const activeItem = $('.tab-manager-item-active')
    const prevItem = activeItem.prev('.tab-manager-item-wrap')[0]
    if (activeItem[0]) {
      if (prevItem) {
        activeItem.removeClass('tab-manager-item-active')
        $(prevItem).addClass('tab-manager-item-active')
        prevItem.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      }
    } else {
      const newActiveItem = $('.tab-manager-item-wrap').last()
      newActiveItem.addClass('tab-manager-item-active')
      newActiveItem[0].scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
  }

  const handleArrowDown = () => {
    // arrowdown
    const activeItem = $('.tab-manager-item-active')
    const nextItem = activeItem.next('.tab-manager-item-wrap')[0]

    if (activeItem[0]) {
      if (nextItem) {
        activeItem.removeClass('tab-manager-item-active')
        $(nextItem).addClass('tab-manager-item-active')
        nextItem.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      }
    } else {
      const newActiveItem = $('.tab-manager-item-wrap').first()
      newActiveItem.addClass('tab-manager-item-active')
    }
  }

  const handleEnter = () => {
    const activeItem = $('.tab-manager-item-active')
    const tabId = activeItem.attr('data-tab')
    if (tabId) {
      handleAction(actions.findIndex((action) => action.id == tabId))
      closePanel()
    }
  }

  const handleTabLeft = async () => {
    await handleGetActions()
    const currentTab = await handleSendMessage({ request: 'get-current-tab' })
    const findTabById = actions.findIndex((tab) => tab.id == currentTab.id)
    if (findTabById > 0) {
      handleAction(findTabById - 1)
      keyMap = {}
    }
  }

  const handleTabRight = async () => {
    await handleGetActions()
    const currentTab = await handleSendMessage({ request: 'get-current-tab' })
    const findTabById = actions.findIndex((tab) => tab.id == currentTab.id)
    if (findTabById != -1 && findTabById < actions.length - 1) {
      handleAction(findTabById + 1)
      keyMap = {}
    }
  }

  const handleSearch = () => {
    const inputValue = $('.tab-manager-head input').val()
    getPanelList(actions.filter((action) => action.title.includes(inputValue)))
  }

  const handleSendMessage = (message) => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => resolve(response))
    })
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

  $(document)
    .keydown((e) => {
      const { keyCode, ctrlKey, metaKey } = e
      keyMap[keyCode] = true

      if (keyCode == 37 && (ctrlKey || (isMac && metaKey))) {
        handleTabLeft()
        return
      }

      if (keyCode == 39 && (ctrlKey || (isMac && metaKey))) {
        handleTabRight()
        return
      }

      if (!isOpen) {
        return
      }

      switch (keyCode) {
        case 38: {
          e.preventDefault()
          handleArrowUp()
          break
        }
        case 40: {
          e.preventDefault()
          handleArrowDown()
          break
        }
        case 13: {
          e.preventDefault()
          handleEnter()
          break
        }
        case 27: {
          e.preventDefault()
          closePanel()
        }
      }
    })
    .keyup((e) => {
      const { keyCode } = e

      delete keyMap[keyCode]
    })

  $(document).on('input', '.tab-manager-head input', handleSearch)

  injectPanelDom()
})
