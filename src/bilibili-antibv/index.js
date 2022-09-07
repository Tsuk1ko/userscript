// ==UserScript==
// @name         Bilibili AntiBV
// @icon         https://www.bilibili.com/favicon.ico
// @namespace    https://moe.best/
// @version      1.9.2
// @description  自动在地址栏中将 bv 还原为 av，非重定向，不会导致页面刷新，顺便清除 search string 中所有无用参数
// @author       神代绮凛
// @include      /^https:\/\/www\.bilibili\.com\/(s\/)?video\/[BbAa][Vv]/
// @require      https://code.bdstatic.com/npm/simple-query-string@1.3.2/src/simplequerystring.min.js
// @license      WTFPL
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  let REDIRECT_S_LINK = GM_getValue('redirect_s_link', true);
  GM_registerMenuCommand('自动重定向 /s/video/xxx', () => {
    REDIRECT_S_LINK = confirm(`自动将 /s/video/xxx 重定向至 /video/xxx
“确定”开启，“取消”关闭
当前：${REDIRECT_S_LINK ? '开启' : '关闭'}`);
    GM_setValue('redirect_s_link', REDIRECT_S_LINK);
  });

  if (REDIRECT_S_LINK && location.pathname.startsWith('/s/video/')) {
    location.pathname = location.pathname.replace(/^\/s/, '');
    return;
  }

  const win = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;

  const last = arr => arr[arr.length - 1];

  const wrapHistory = method => {
    const fn = win.history[method];
    const e = new Event(method);
    return function () {
      setTimeout(() => window.dispatchEvent(e));
      return fn.apply(this, arguments);
    };
  };
  win.history.pushState = wrapHistory('pushState');

  win.history.replaceState = (() => {
    const fn = win.history.replaceState;
    return function (state, unused, url, isMe) {
      if (isMe) return fn.apply(this, [state, unused, url]);
      try {
        state = { ...history.state, ...state };
        const urlObj = new URL(url.startsWith('/') ? `${location.origin}${url}` : url);
        urlObj.search = purgeSearchString(urlObj.search);
        const bvid = getBvidFromUrl(urlObj.pathname);
        if (bvid) urlObj.pathname = location.pathname;
        url = urlObj.href.replace(urlObj.origin, '');
      } catch (e) {
        console.error(e);
      }
      return fn.apply(this, [state, unused, url]);
    };
  })();

  // 弃用，不够及时
  // Get from __INITIAL_STATE__
  // const get = key => {
  //     const is = win.__INITIAL_STATE__ || {};
  //     return (is.videoData && is.videoData[key]) || is[key] || win[key];
  // };
  const get = key => win[key];
  const getBvidFromUrl = pathname => {
    const lastPath = last(pathname.split('/').filter(v => v));
    return /^bv/i.test(lastPath) ? lastPath : null;
  };
  const getUrl = id => `/video/${id}${purgeSearchString(location.search)}${location.hash}`;

  // https://www.zhihu.com/question/381784377/answer/1099438784
  const bv2av = bv => {
    if (!bv) return;

    const pos = [11, 10, 3, 8, 4, 6];
    const base = 'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF';
    const table = {};
    for (let i = 0; i < base.length; i++) table[base[i]] = i;

    let r = 0;
    for (let i = 0; i < pos.length; i++) r += table[bv[pos[i]]] * 58 ** i;
    return (r - 8728348608) ^ 177451812;
  };

  const purgeSearchString = search => {
    const { p, t } = simpleQueryString.parse(search);
    const result = simpleQueryString.stringify({ p, t });
    return result ? `?${result}` : '';
  };

  const replaceUrl = () => {
    const bvid = get('bvid') || getBvidFromUrl(location.pathname);
    const aid = get('aid') || bv2av(bvid);
    if (!aid) return;
    const avUrl = getUrl(`av${aid}`);
    const BABKey = `BAB-${avUrl}`;
    if (sessionStorage.getItem(BABKey)) {
      console.warn('[Bilibili AntiBV] abort');
      return;
    }
    sessionStorage.setItem(BABKey, 1);
    setTimeout(() => sessionStorage.removeItem(BABKey), 1000);
    history.replaceState({ ...history.state, aid, bvid }, '', avUrl, true);
  };

  const replaceBack = ({ state }) => {
    const { aid, bvid } = state;
    if (!bvid) return;
    history.replaceState(state, '', getUrl(bvid), true);
    setTimeout(() => history.replaceState(state, '', getUrl(`av${aid}`), true));
  };

  window.addEventListener('load', replaceUrl, { once: true });
  window.addEventListener('pushState', replaceUrl);
  window.addEventListener('popstate', replaceBack);
})();
