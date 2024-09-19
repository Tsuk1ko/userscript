// ==UserScript==
// @name         Bilibili 哔哩哔哩阻止动态点击正文跳转
// @icon         https://t.bilibili.com/favicon.ico
// @namespace    https://lolicon.app/
// @version      1.1.7
// @description  阻止动态点击正文跳转动态页面
// @author       Jindai Kirin
// @match        https://t.bilibili.com/*
// @match        https://space.bilibili.com/*
// @license      MIT
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  const css = ([style]) => GM_addStyle(style);

  css`
    .description.active,
    .bili-dyn-content__orig__desc:not(
        .bili-dyn-content__orig.reference .bili-dyn-content__orig__desc
      ),
    .dyn-card-opus__summary:not(.bili-dyn-content__orig.reference .dyn-card-opus__summary):not(
        .dyn-card-opus__title + .dyn-card-opus__summary
      ),
    .bili-dyn-content__forw__desc {
      cursor: unset !important;
    }
    .bili-rich-text-emoji {
      -webkit-user-drag: none;
    }
    .up-info-tip:hover {
      color: #ff85ad !important;
      cursor: pointer;
    }
  `;

  const contentClassList = [
    'bili-rich-text',
    'bili-rich-text__content',
    'content-full',
    'content-ellipsis',
    'content',
  ];
  const skipClassList = [
    'bili-rich-text__action',
    'bili-rich-text-module',
    'bili-rich-text-link',
    'bili-rich-text-topic',
    'bili-rich-text-viewpic',
    'dynamic-link-hover-bg',
  ];

  /**
   * @param {HTMLElement} element
   * @param {string} className
   */
  const hasClass = (element, className) => element.classList.contains(className);
  /**
   * @param {HTMLElement} element
   * @param {string[]} classNameList
   */
  const hasSomeClass = (element, classNameList) =>
    classNameList.some(className => hasClass(element, className));

  /**
   * @param {HTMLElement} element
   */
  const isContentElement = element =>
    hasSomeClass(element, contentClassList) && !hasClass(element.parentElement, 'user-panel');
  /**
   * @param {HTMLElement} element
   */
  const isSkipElement = element => hasSomeClass(element, skipClassList);
  /**
   * @param {HTMLElement} element
   */
  const isNeedClickParentElement = element => hasClass(element, 'lottery-btn');

  document.addEventListener(
    'click',
    e => {
      /** @type {HTMLElement} */
      const $el = e.target;
      // 不处理动态链接
      if (isSkipElement($el)) return;
      // 扩大互动抽奖按钮点击范围（B站自己就没处理好，原本点 icon 是不能打开抽奖面板的）
      if (isNeedClickParentElement($el)) {
        e.stopPropagation();
        e.preventDefault();
        $el.parentElement.click();
        return;
      }
      // 提供转发原文跳转到动态页面的方式
      if (hasClass($el, 'up-info-tip')) {
        try {
          const did = $el.parentElement.parentElement.parentElement.getAttribute('data-ori-did');
          if (did) window.open(`https://t.bilibili.com/${did}?tab=2`, '_blank');
        } catch (e) {
          console.error(e);
        }
      }
      // 触发路径
      const path = e.composedPath();
      // 转发内容不处理，因为现在无法通过页面元素得到 dynamic id
      for (const ele of path) {
        if (ele.nodeName === 'BODY') break;
        if (hasClass(ele, 'bili-dyn-content__orig') && hasClass(ele, 'reference')) return;
      }
      // 阻止点击正文跳转到动态页面
      if (isContentElement($el) || isContentElement(path[1])) {
        e.stopPropagation();
      }
    },
    { capture: true }
  );
})();
