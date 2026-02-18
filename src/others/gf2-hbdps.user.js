// ==UserScript==
// @name         少前2金币大放送活动一键脚本
// @namespace    https://github.com/Tsuk1ko
// @version      1.2.0
// @description  一键完成少前2金币大放送活动
// @author       神代綺凛
// @match        https://gf2.sunborngame.com/hbdps/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=sunborngame.com
// @require      https://unpkg.com/js-md5@0.8.3/src/md5.js
// @license      MIT
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function getRandomScore() {
    return Math.floor(Math.random() * 6) + 50;
  }

  function getSign(num, time) {
    return md5(`${num}${time}cjhbps`);
  }

  async function request(path, data) {
    const options = {
      headers: { Authorization: localStorage.getItem('key') },
    };
    if (data) {
      options.method = 'POST';
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    }
    const res = await fetch(`https://gf2-redbag-api.sunborngame.com/${path}`, options);
    return res.json();
  }

  async function doShare() {
    try {
      const data = await request('share', {});
      console.log('share result:', data);
    } catch (error) {
      console.error('share error:', error);
    }
  }

  async function doGacha() {
    const num = getRandomScore();
    const time = Math.floor(Date.now() / 1000);
    const sign = getSign(num, time);
    return request('gacha', { num, sign, time });
  }

  /**
   *
   * @returns {Promise<Array<{ prize_id: number, des: string }>>}
   */
  async function getRewards() {
    const data = await request('reward_log?page=1&limit=10000');
    console.log('rewards:', data);
    return data.data.list;
  }

  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.inset = 'auto auto 8px 8px';
  div.style.display = 'flex';
  div.style.flexDirection = 'column';
  div.style.gap = '8px';

  /**
   * @param {string} text
   * @param {() => Promise<void>} onClick
   */
  const createBtn = (text, onClick) => {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.fontSize = '24px';
    button.style.padding = '4px 8px';
    button.style.whiteSpace = 'nowrap';
    button.addEventListener('click', async () => {
      try {
        button.disabled = true;
        button.textContent = '请求中...';
        await onClick();
      } finally {
        button.disabled = false;
        button.textContent = text;
      }
    });
    div.appendChild(button);
  };

  createBtn('一键完成', async () => {
    await doShare();

    let count = 0;
    let failed = false;
    const redBagCodes = [];

    while (true) {
      if (count >= 10) break; // 保护

      try {
        const data = await doGacha();
        console.log('gacha result:', data);
        const isSuccess = data.Code === 0;
        const isFinished = data.Code === 150004;
        if (isSuccess) {
          count++;
          const code = data.data?.red_bag_code;
          if (code) redBagCodes.push(code);
        } else {
          if (!isFinished) failed = true;
          break;
        }
      } catch (err) {
        console.error(err);
        break;
      }
    }

    if (redBagCodes.length) console.log(`检测到中奖了红包封面兑换码\n${redBagCodes.join('\n')}`);

    if (failed) alert('请求失败，请查看控制台');
    else if (count > 0) {
      let msg = `已完成 ${count} 次，请检查中奖记录`;
      if (redBagCodes.length) msg += '\n检测到中奖了红包封面兑换码，请前往中奖记录或控制台查看';
      alert(msg);
    } else alert('游玩次数不足');
  });

  createBtn('统计奖品', async () => {
    const list = await getRewards();

    /** @type {Record<number, { count: number, des: string }>} */
    const prizeMap = {};

    list.forEach(({ prize_id, des }) => {
      if (prizeMap[prize_id]) {
        prizeMap[prize_id].count++;
      } else {
        prizeMap[prize_id] = {
          id: prize_id,
          count: 1,
          des,
        };
      }
    });

    const resultMap = {};

    Object.values(prizeMap).forEach(({ count, des }) => {
      const [name, numStr] = des.split('*');
      const num = Number(numStr) || 1;
      resultMap[name] = (resultMap[name] || 0) + num * count;
    });

    console.table(resultMap);

    const result = Object.entries(resultMap)
      .map(([name, count]) => `${name} * ${count}`)
      .join('\n');

    alert(result);
  });

  document.body.appendChild(div);
})();
