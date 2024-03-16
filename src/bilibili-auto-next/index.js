// ==UserScript==
// @name         Bilibili 哔哩哔哩自动切P
// @namespace    https://github.com/Tsuk1ko
// @version      1.0.7
// @description  为什么要单独写个脚本呢？因为自动连播就是个傻逼……
// @author       神代綺凛
// @license      GPL-3.0
// @match        https://www.bilibili.com/video/*
// @icon         https://www.bilibili.com/favicon.ico
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(() => {
  'use strict';

  const log = (...args) => console.log('[BilibiliAutoNext]', ...args);

  const playerVideoEndedEvents = ['video_media_ended', 'MEDIA_ENDED'];
  const playerDestroyEvents = ['video_destroy'];

  const win = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;

  const get = (obj, paths) =>
    paths.reduce((prev, path) => (typeof prev === 'undefined' ? undefined : prev[path]), obj);

  const initPlayer = player => {
    if (!player) return;
    playerVideoEndedEvents.forEach(event => {
      player.on(event, onVideoEnded);
    });
    playerDestroyEvents.forEach(event => {
      player.on(event, () => setTimeout(initPlayer));
    });
    log('initialized successfully');
  };

  const onVideoEnded = () => {
    const curP = get(win, ['__INITIAL_STATE__', 'p']);
    const totalP = get(win, ['__INITIAL_STATE__', 'videoData', 'videos']);
    log(`video ended ${curP}/${totalP}`);
    if (curP < totalP) {
      log('goto next video');
      setTimeout(() => player.next(), 100);
    }
  };

  const waitWinProperty = (name, timeout = 10000) =>
    new Promise((resolve, reject) => {
      const val = win[name];
      if (val) {
        resolve(val);
        return;
      }
      const timeoutTimer = setTimeout(() => {
        clearInterval(timer);
        reject();
      }, timeout);
      const timer = setInterval(() => {
        const val = win[name];
        if (val) {
          clearTimeout(timeoutTimer);
          clearInterval(timer);
          resolve(val);
        }
      }, 200);
    });

  waitWinProperty('player').then(initPlayer);
})();
