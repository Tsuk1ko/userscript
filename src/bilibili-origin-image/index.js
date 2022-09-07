// ==UserScript==
// @name         Bilibili 哔哩哔哩查看原图
// @icon         https://t.bilibili.com/favicon.ico
// @namespace    https://lolico.moe/
// @version      2.3.4
// @description  方便在B站内查看各种图片的原图，支持动态、专栏
// @author       Jindai Kirin
// @match        https://t.bilibili.com/*
// @match        https://space.bilibili.com/*
// @match        https://www.bilibili.com/read/*
// @license      GPL-3.0
// @grant        GM_addStyle
// @run-at       document-end
// @require      https://code.bdstatic.com/npm/jquery@3.6.0/dist/jquery.min.js
// ==/UserScript==

(function () {
  'use strict';

  if (location.hostname === 't.bilibili.com' || location.hostname === 'space.bilibili.com') {
    // 添加查看原图按钮
    document.addEventListener(
      'click',
      async ({ target }) => {
        const $target = $(target);
        // new
        if ($target.hasClass('bili-album__preview__picture__img')) {
          const $imagesbox = $target.parents('.bili-album');
          if ($imagesbox.find('.bili-album__watch__control__option.raw-image').length) return;
          const $btn = $imagesbox.find('.bili-album__watch__control__option.full-screen');
          const $newBtn = $($btn.prop('outerHTML').replace('大', '原'));
          $newBtn.addClass('raw-image');
          $newBtn.on('click', () => {
            window.open(
              $imagesbox.find('.bili-album__watch__content img').attr('src').replace(/@.*?$/, ''),
              '_blank'
            );
          });
          $btn.after($newBtn);
        }
        // old
        else if ($target.hasClass('img-content')) {
          const $imagesbox = $('.imagesbox:hover');
          const $btn = await waitViewBtn($imagesbox);
          const $newBtn = $($btn.prop('outerHTML').replace('大', '原'));
          $newBtn.on('click', () => {
            window.open(
              $imagesbox.find('.boost-img img').attr('src').replace(/@.*?$/, ''),
              '_blank'
            );
          });
          $btn.after($newBtn);
          const removeBtn = () => $newBtn.remove();
          $imagesbox.find('.bp-v-middle:contains(收起)').one('click', removeBtn);
          $imagesbox.find('.boost-img').one('click', removeBtn);
        }
      },
      { capture: true }
    );
  } else if (location.href.startsWith('https://www.bilibili.com/read/')) {
    GM_addStyle('img.normal-img,.card-image__image{cursor:pointer}');
    // 专栏图片点击打开原图
    $('img.normal-img').each(function () {
      const $img = $(this);
      $img.on('click', () => {
        window.open($img.attr('src').replace(/@.*?$/, ''));
      });
      $img.attr('title', '点击打开原图');
    });
    // 专栏头图点击打开原图
    $('.card-image__image').each(function () {
      const $div = $(this);
      $div.on('click', () => {
        window.open(
          $div
            .css('background-image')
            .replace(/^url\(["']?/, '')
            .replace(/["']?\)$/, '')
            .replace(/@.*?$/, ''),
          '_blank'
        );
      });
      $div.attr('title', '点击打开原图');
    });
  }

  /**
   * 等待查看大图按钮出现
   * @param {JQuery<HTMLElement>} $imagesbox
   * @returns {JQuery<HTMLElement>}
   */
  function waitViewBtn($imagesbox) {
    return new Promise(resolve => {
      const $btn = $imagesbox.find('.bp-v-middle:contains(查看大图)');
      if ($btn.length > 0) {
        resolve($btn);
        return;
      }
      new MutationObserver((mutations, self) => {
        mutations.forEach(({ addedNodes }) => {
          if (addedNodes.length > 0 && addedNodes[0].className === 'boost-wrap') {
            self.disconnect();
            resolve($imagesbox.find('.bp-v-middle:contains(查看大图)'));
          }
        });
      }).observe($imagesbox[0], { childList: true });
    });
  }
})();
