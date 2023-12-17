// ==UserScript==
// @name         Bilibili 哔哩哔哩查看原图
// @icon         https://t.bilibili.com/favicon.ico
// @namespace    https://lolico.moe/
// @version      3.0.1
// @description  方便在B站内查看各种图片的原图，目前仅处理专栏，动态中官方提供的“查看大图”已经为原图
// @author       Jindai Kirin
// @match        https://www.bilibili.com/read/*
// @license      GPL-3.0
// @grant        GM_addStyle
// @run-at       document-end
// @require      https://code.bdstatic.com/npm/jquery@3.6.0/dist/jquery.min.js
// ==/UserScript==

(function () {
  'use strict';

  const css = ([style]) => GM_addStyle(style);

  if (location.hostname === 'www.bilibili.com' && location.pathname.startsWith('/read/')) {
    css`
      img.normal-img,
      .card-image__image {
        cursor: pointer;
      }
    `;
    // 专栏图片点击打开原图
    $(document.body).on('click', 'img.normal-img', function () {
      window.open($(this).attr('src').replace(/@.*?$/, ''));
    });
    // 专栏头图点击打开原图
    $(document.body).on('click', '.card-image__image', function () {
      window.open(
        $(this)
          .css('background-image')
          .replace(/^url\(["']?/, '')
          .replace(/["']?\)$/, '')
          .replace(/@.*?$/, ''),
        '_blank'
      );
    });
  }
})();
