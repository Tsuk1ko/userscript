// ==UserScript==
// @name         Bilibili 哔哩哔哩查看原图
// @icon         https://t.bilibili.com/favicon.ico
// @namespace    https://lolico.moe/
// @version      2.4.0
// @description  方便在B站内查看各种图片的原图，支持动态、专栏
// @author       Jindai Kirin
// @match        https://t.bilibili.com/*
// @match        https://space.bilibili.com/*
// @match        https://www.bilibili.com/opus/*
// @match        https://www.bilibili.com/read/*
// @license      GPL-3.0
// @grant        GM_addStyle
// @run-at       document-end
// @require      https://code.bdstatic.com/npm/jquery@3.6.0/dist/jquery.min.js
// ==/UserScript==

(function () {
  'use strict';

  if (
    location.hostname === 't.bilibili.com' ||
    location.hostname === 'space.bilibili.com' ||
    (location.hostname === 'www.bilibili.com' && location.pathname.startsWith('/opus/'))
  ) {
    // 添加查看原图按钮
    document.addEventListener(
      'click',
      async ({ target }) => {
        const $target = $(target);
        // new
        if (
          $target.hasClass('bili-album__preview__picture__img') ||
          $target.parent().hasClass('b-img__inner')
        ) {
          const $album = $target.parents('.bili-album');
          const $btn = await waitBtn(
            $album,
            '.bili-album__watch__control__option.full-screen',
            '.bili-album__watch'
          );
          if ($btn.length > 1) return;
          const $newBtn = $($btn.prop('outerHTML').replace('大', '原'));
          $newBtn.addClass('raw-image');
          $newBtn.on('click', () => {
            window.open(
              $album.find('.bili-album__watch__content img').attr('src').replace(/@.*$/, ''),
              '_blank'
            );
          });
          $btn.after($newBtn);
        }
        // old
        else if ($target.hasClass('img-content')) {
          const $imagesbox = $('.imagesbox:hover');
          const $btn = await waitBtn($imagesbox, '.bp-v-middle:contains(查看大图)', '.boost-wrap');
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
  } else if (location.hostname === 'www.bilibili.com' && location.pathname.startsWith('/read/')) {
    GM_addStyle('img.normal-img,.card-image__image{cursor:pointer}');
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

  /**
   * 等待查看大图按钮出现
   * @param {JQuery<HTMLElement>} $el
   * @param {string} btnSelector
   * @param {string} waitNodeSelector
   * @returns {JQuery<HTMLElement>}
   */
  function waitBtn($el, btnSelector, waitNodeSelector) {
    return new Promise(resolve => {
      const $btn = $el.find(btnSelector);
      if ($btn.length > 0) {
        resolve($btn);
        return;
      }
      new MutationObserver((mutations, self) => {
        mutations.forEach(({ addedNodes }) => {
          if (addedNodes.length && $(addedNodes[0]).is(waitNodeSelector)) {
            self.disconnect();
            resolve($el.find(btnSelector));
          }
        });
      }).observe($el[0], { childList: true });
    });
  }
})();
