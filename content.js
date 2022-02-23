/*
 * @Author: MonsterXue
 * @Date: 2022-02-18 17:07:57
 * @LastEditTime: 2022-02-23 18:24:11
 * @LastEditors: MonsterXue
 * @FilePath: \tab-manager\content.js
 * @Description:
 */

let isOpen = false

$(function () {
  let actions = []

  $.get(chrome.runtime.getURL('content.html'), (data) => {
    $(data).appendTo('body')
  })

  const closePanel = () => {
    isOpen = false
    $('.tab-manager-wrap').addClass('tab-manager-closing')
  }

  const openPanel = () => {
    handleGetActions(() => {
      isOpen = true
      $('.tab-manager-wrap').removeClass('tab-manager-closing')
      getPanelList()
    })
  }

  const getPanelList = () => {
    $('.tab-manager-content').html('')
    console.log(actions)
    actions.forEach((tab, index) => {
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
      panelList += `<div class="tab-manager-item-wrap" data-ind=${index}>
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

  const handleGetActions = (cb) => {
    chrome.runtime.sendMessage({ request: 'get-actions' }, (response) => {
      actions = response.actions
      cb(response)
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

  chrome.runtime.onMessage.addListener((message, sender, response) => {
    if (message.request == 'icon-click') {
      if (isOpen) {
        closePanel()
      } else {
        openPanel()
      }
    }
  })

  $(document).keydown((e) => {
    if (!isOpen) {
      return
    }

    const { keyCode } = e

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
    }
  })
})
