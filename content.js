/*
 * @Author: MonsterXue
 * @Date: 2022-02-18 17:07:57
 * @LastEditTime: 2022-02-18 18:23:43
 * @LastEditors: MonsterXue
 * @FilePath: \tab-manager\content.js
 * @Description: 
 */

$(function() {
  $.get(chrome.runtime.getURL('content.html'), (data) => {
    console.log(data)
    $(data).appendTo('body')
  })
})
