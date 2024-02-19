// ==UserScript==
// @name         Bilibili 哔哩哔哩视频点踩
// @namespace    https://github.com/Tsuk1ko
// @version      1.0.0
// @description  为视频页面增加点踩选项，在视频下方工具栏最右边更多菜单中
// @author       神代綺凛
// @license      GPL-3.0
// @match        https://www.bilibili.com/video/*
// @icon         https://www.bilibili.com/favicon.ico
// @connect      passport.bilibili.com
// @connect      app.bilibili.com
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(async () => {
  'use strict';

  // https://github.com/lzghzr/TampermonkeyJS/blob/master/libBilibiliToken/libBilibiliToken.js
  class BilibiliToken {
    static _W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow;
    static __loginSecretKey = '2653583c8873dea268ab9386918b1d65';
    static loginAppKey = '783bbb7264451d82';
    static __secretKey = '560c52ccd288fed045859ed18bffd973';
    static appKey = '1d8b6e7d45233436';
    build = '6720300';
    buvid = BilibiliToken.buvidXX;
    Clocale = 'zh-Hans_CN';
    channel = 'website';
    localId = this.buvid;
    mobiApp = 'android';
    platform = 'android';
    Slocale = 'zh-Hans_CN';
    static get buvidXX() {
      const buvid = this.md5(Math.random().toString()).toUpperCase();
      return 'XX' + buvid[2] + buvid[12] + buvid[22] + buvid;
    }
    static get TS() {
      return Math.floor(Date.now() / 1000);
    }
    headers = {
      'user-agent':
        'Mozilla/5.0 BiliDroid/6.72.0 (bbcallen@gmail.com) os/android model/XQ-CT72 mobi_app/android build/6720300 channel/bilih5 innerVer/6720310 osVer/12 network/2',
      buvid: this.buvid,
    };
    get loginQuery() {
      return `appkey=${BilibiliToken.loginAppKey}&build=${this.build}&c_locale=${this.Clocale}&channel=${this.channel}&local_id=${this.localId}&mobi_app=${this.mobiApp}&platform=${this.platform}&s_locale=${this.Slocale}`;
    }
    static signQuery(params, ts = true, secretKey = this.__secretKey) {
      let paramsSort = params;
      if (ts) paramsSort = `${params}&ts=${this.TS}`;
      paramsSort = paramsSort.split('&').sort().join('&');
      const paramsSecret = paramsSort + secretKey;
      const paramsHash = this.md5(paramsSecret);
      return `${paramsSort}&sign=${paramsHash}`;
    }
    signLoginQuery(params) {
      const paramsBase = params === undefined ? this.loginQuery : `${params}&${this.loginQuery}`;
      return BilibiliToken.signQuery(paramsBase, true, BilibiliToken.__loginSecretKey);
    }
    async getAuthCode() {
      const authCode = await BilibiliToken.XHR({
        GM: true,
        anonymous: true,
        method: 'POST',
        url: 'https://passport.bilibili.com/x/passport-tv-login/qrcode/auth_code',
        data: this.signLoginQuery(),
        responseType: 'json',
        headers: this.headers,
      });
      if (authCode !== undefined && authCode.response.status === 200 && authCode.body.code === 0)
        return authCode.body.data.auth_code;
      return console.error(GM_info.script.name, 'getAuthCode', authCode);
    }
    async qrcodeConfirm(authCode, csrf) {
      const confirm = await BilibiliToken.XHR({
        GM: true,
        method: 'POST',
        url: 'https://passport.bilibili.com/x/passport-tv-login/h5/qrcode/confirm',
        data: `auth_code=${authCode}&csrf=${csrf}&scanning_type=1`,
        responseType: 'json',
        headers: this.headers,
      });
      if (confirm !== undefined && confirm.response.status === 200 && confirm.body.code === 0)
        return confirm.body.data.gourl;
      return console.error(GM_info.script.name, 'qrcodeConfirm', confirm);
    }
    async qrcodePoll(authCode) {
      const poll = await BilibiliToken.XHR({
        GM: true,
        anonymous: true,
        method: 'POST',
        url: 'https://passport.bilibili.com/x/passport-tv-login/qrcode/poll',
        data: this.signLoginQuery(`auth_code=${authCode}`),
        responseType: 'json',
        headers: this.headers,
      });
      if (poll !== undefined && poll.response.status === 200 && poll.body.code === 0)
        return poll.body.data;
      return console.error(GM_info.script.name, 'qrcodePoll', poll);
    }
    async getToken() {
      const cookie = BilibiliToken._W.document.cookie.match(/bili_jct=(?<csrf>.*?);/);
      if (cookie === null || cookie.groups === undefined)
        return console.error(GM_info.script.name, 'getToken', 'cookie获取失败');
      const csrf = cookie.groups['csrf'];
      const authCode = await this.getAuthCode();
      if (authCode === undefined) return;
      const confirm = await this.qrcodeConfirm(authCode, csrf);
      if (confirm === undefined) return;
      const token = await this.qrcodePoll(authCode);
      if (token === undefined) return;
      return token;
    }
    static md5(string, key, raw) {
      return md5(string, key, raw);
      function safeAdd(x, y) {
        var lsw = (x & 0xffff) + (y & 0xffff);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xffff);
      }
      function bitRotateLeft(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
      }
      function md5cmn(q, a, b, x, s, t) {
        return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
      }
      function md5ff(a, b, c, d, x, s, t) {
        return md5cmn((b & c) | (~b & d), a, b, x, s, t);
      }
      function md5gg(a, b, c, d, x, s, t) {
        return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
      }
      function md5hh(a, b, c, d, x, s, t) {
        return md5cmn(b ^ c ^ d, a, b, x, s, t);
      }
      function md5ii(a, b, c, d, x, s, t) {
        return md5cmn(c ^ (b | ~d), a, b, x, s, t);
      }
      function binlMD5(x, len) {
        x[len >> 5] |= 0x80 << len % 32;
        x[(((len + 64) >>> 9) << 4) + 14] = len;
        var i;
        var olda;
        var oldb;
        var oldc;
        var oldd;
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
        for (i = 0; i < x.length; i += 16) {
          olda = a;
          oldb = b;
          oldc = c;
          oldd = d;
          a = md5ff(a, b, c, d, x[i], 7, -680876936);
          d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
          c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
          b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
          a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
          d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
          c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
          b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
          a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
          d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
          c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
          b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
          a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
          d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
          c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
          b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
          a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
          d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
          c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
          b = md5gg(b, c, d, a, x[i], 20, -373897302);
          a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
          d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
          c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
          b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
          a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
          d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
          c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
          b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
          a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
          d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
          c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
          b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
          a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
          d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
          c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
          b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
          a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
          d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
          c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
          b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
          a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
          d = md5hh(d, a, b, c, x[i], 11, -358537222);
          c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
          b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
          a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
          d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
          c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
          b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
          a = md5ii(a, b, c, d, x[i], 6, -198630844);
          d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
          c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
          b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
          a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
          d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
          c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
          b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
          a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
          d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
          c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
          b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
          a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
          d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
          c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
          b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
          a = safeAdd(a, olda);
          b = safeAdd(b, oldb);
          c = safeAdd(c, oldc);
          d = safeAdd(d, oldd);
        }
        return [a, b, c, d];
      }
      function binl2rstr(input) {
        var i;
        var output = '';
        var length32 = input.length * 32;
        for (i = 0; i < length32; i += 8) {
          output += String.fromCharCode((input[i >> 5] >>> i % 32) & 0xff);
        }
        return output;
      }
      function rstr2binl(input) {
        var i;
        var output = [];
        output[(input.length >> 2) - 1] = undefined;
        for (i = 0; i < output.length; i += 1) {
          output[i] = 0;
        }
        var length8 = input.length * 8;
        for (i = 0; i < length8; i += 8) {
          output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << i % 32;
        }
        return output;
      }
      function rstrMD5(s) {
        return binl2rstr(binlMD5(rstr2binl(s), s.length * 8));
      }
      function rstrHMACMD5(key, data) {
        var i;
        var bkey = rstr2binl(key);
        var ipad = [];
        var opad = [];
        var hash;
        ipad[15] = opad[15] = undefined;
        if (bkey.length > 16) {
          bkey = binlMD5(bkey, key.length * 8);
        }
        for (i = 0; i < 16; i += 1) {
          ipad[i] = bkey[i] ^ 0x36363636;
          opad[i] = bkey[i] ^ 0x5c5c5c5c;
        }
        hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binlMD5(opad.concat(hash), 512 + 128));
      }
      function rstr2hex(input) {
        var hexTab = '0123456789abcdef';
        var output = '';
        var x;
        var i;
        for (i = 0; i < input.length; i += 1) {
          x = input.charCodeAt(i);
          output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
        }
        return output;
      }
      function str2rstrUTF8(input) {
        return unescape(encodeURIComponent(input));
      }
      function rawMD5(s) {
        return rstrMD5(str2rstrUTF8(s));
      }
      function hexMD5(s) {
        return rstr2hex(rawMD5(s));
      }
      function rawHMACMD5(k, d) {
        return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d));
      }
      function hexHMACMD5(k, d) {
        return rstr2hex(rawHMACMD5(k, d));
      }
      function md5(string, key, raw) {
        if (!key) {
          if (!raw) {
            return hexMD5(string);
          }
          return rawMD5(string);
        }
        if (!raw) {
          return hexHMACMD5(key, string);
        }
        return rawHMACMD5(key, string);
      }
    }
    static XHR(XHROptions) {
      return new Promise(resolve => {
        const onerror = error => {
          console.error(GM_info.script.name, error);
          resolve(undefined);
        };
        if (XHROptions.GM) {
          if (XHROptions.method === 'POST') {
            if (XHROptions.headers === undefined) XHROptions.headers = {};
            if (XHROptions.headers['Content-Type'] === undefined)
              XHROptions.headers['Content-Type'] =
                'application/x-www-form-urlencoded; charset=utf-8';
          }
          XHROptions.timeout = 30 * 1000;
          XHROptions.onload = res => resolve({ response: res, body: res.response });
          XHROptions.onerror = onerror;
          XHROptions.ontimeout = onerror;
          GM_xmlhttpRequest(XHROptions);
        } else {
          const xhr = new XMLHttpRequest();
          xhr.open(XHROptions.method, XHROptions.url);
          if (XHROptions.method === 'POST' && xhr.getResponseHeader('Content-Type') === null)
            xhr.setRequestHeader(
              'Content-Type',
              'application/x-www-form-urlencoded; charset=utf-8'
            );
          if (XHROptions.withCredentials) xhr.withCredentials = true;
          if (XHROptions.responseType !== undefined) xhr.responseType = XHROptions.responseType;
          xhr.timeout = 30 * 1000;
          xhr.onload = ev => {
            const res = ev.target;
            resolve({ response: res, body: res.response });
          };
          xhr.onerror = onerror;
          xhr.ontimeout = onerror;
          xhr.send(XHROptions.data);
        }
      });
    }
  }

  GM_registerMenuCommand('重置 access_key', () => {
    GM_deleteValue('access_key');
    alert('刷新页面生效');
  });

  const css = ([style]) => GM_addStyle(style);

  css`
    .video-dislike-icon {
      transform: scaleY(-1);
    }
  `;

  const client = new BilibiliToken();

  const accessKey = await (async () => {
    const saved = GM_getValue('access_key');
    if (saved) return saved;
    const data = await client.getToken();
    console.warn('data', data);
    const val = data?.access_token;
    if (val) GM_setValue('access_key', val);
    return val;
  })();

  const queryStringify = data =>
    Object.entries(data)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');

  const dislike = async (isCancel = false) => {
    if (!accessKey) {
      alert('access_key 未成功获取，功能不可用');
      throw new Error('no access_key');
    }
    const params = BilibiliToken.signQuery(
      queryStringify({
        access_key: accessKey,
        actionKey: 'appkey',
        aid: BilibiliToken._W.__INITIAL_STATE__.aid,
        appkey: BilibiliToken.appKey,
        build: client.build,
        c_locale: client.Clocale,
        device: 'phone',
        disable_rcmd: 0,
        dislike: isCancel ? 1 : 0,
        mobi_app: client.mobiApp,
        platform: client.platform,
        s_locale: client.Slocale,
      })
    );
    const data = await BilibiliToken.XHR({
      GM: true,
      anonymous: true,
      method: 'POST',
      url: 'https://app.bilibili.com/x/v2/view/dislike',
      data: params,
      responseType: 'json',
      headers: client.headers,
    });
    console.log('[BilibiliDislike]', data);
    return data.body;
  };

  /**
   * @param {string} selector
   * @param {number} [timeout]
   * @returns {Promise<HTMLElement>}
   */
  const waitSelector = (selector, timeout = 10000) =>
    new Promise((resolve, reject) => {
      const el = document.querySelector(selector);
      if (el) {
        resolve(el);
        return;
      }
      const timeoutTimer = setTimeout(() => {
        clearInterval(timer);
        reject();
      }, timeout);
      const timer = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearTimeout(timeoutTimer);
          clearInterval(timer);
          resolve(el);
        }
      }, 200);
    });

  const showToast = text => {
    BilibiliToken._W.player.toast.create({ text, duration: 3000 });
  };

  window.addEventListener('load', async () => {
    /** @type {SVGElement} */
    const dislikeIcon = (await waitSelector('.toolbar-left-item-wrap .video-like svg')).cloneNode(
      true
    );
    dislikeIcon.classList.replace('video-like-icon', 'video-dislike-icon');

    const rightItem = await waitSelector('.video-complaint.video-toolbar-right-item');
    /** @type {HTMLElement} */
    const dislikeBtn = rightItem.cloneNode(true);
    dislikeBtn.classList.replace('video-complaint', 'video-dislike');
    const text = dislikeBtn.querySelector('.video-toolbar-item-text');
    text.classList.remove('video-use-phone-info');
    text.innerHTML = '不喜欢';
    dislikeBtn.addEventListener('click', async () => {
      const { code, message } = await dislike();
      if (code === 0) {
        showToast('点踩成功');
      } else {
        showToast(message);
      }
    });
    dislikeBtn.addEventListener('contextmenu', async e => {
      e.preventDefault();
      const { code, message } = await dislike(true);
      if (code === 0) {
        showToast('取消点踩成功');
      } else {
        showToast(message);
      }
    });
    dislikeBtn.querySelector('svg').replaceWith(dislikeIcon);
    rightItem.after(dislikeBtn);
  });
})();
