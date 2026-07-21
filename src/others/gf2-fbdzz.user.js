// ==UserScript==
// @name         少前2缝补大作战一键脚本
// @namespace    https://github.com/Tsuk1ko
// @version      1.0.0
// @description  一键完成少前2缝补大作战网页活动
// @author       神代綺凛
// @match        https://gf2.sunborngame.com/amhfbdzz/*
// @icon         https://favicon.im/gf2.sunborngame.com
// @license      MIT
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const API_BASE = 'https://gf2-h5elmorebuild-api.sunborngame.com/';

  class ApiError extends Error {
    /**
     * @param {number} code
     * @param {string} message
     */
    constructor(code, message) {
      super(message);
      this.code = code;
    }
  }

  function getRandomScore() {
    return Math.floor(Math.random() * 6) + 20;
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
    const res = await fetch(`${API_BASE}${path}`, options);
    const { Code, Message, data: resp } = await res.json();
    if (Code !== 0) throw new ApiError(Code, Message);
    return resp?.data;
  }

  async function doGame() {
    const score = getRandomScore();
    await request('task/play_game', { score });
  }

  async function doShare() {
    await request('task/share', {});
  }

  async function doLottery() {
    const { remain_cnt } = await request('lottery/remain_cnt', {});

    let needFillAddr = false;

    for (let i = 0; i < remain_cnt; i++) {
      const { prize_type } = await request('lottery/do', {});
      if (prize_type > 0) needFillAddr = true;
    }

    return {
      count: remain_cnt,
      needFillAddr,
    };
  }

  /**
   * @returns {{ play: number, share: number }}
   */
  async function getTaskStatus() {
    const status = await request('task/get_daily_task_status', {});
    if (!status) throw new Error('获取任务状态失败');
    return {
      play: status.play_cnt,
      share: status.share_cnt,
    };
  }

  async function showLotteryHistory() {
    const items = [
      '萨狄斯金*2000&2000',
      '战场报告*2000&2000',
      '解析图纸*2000&2000',
      '转录导体·序二*10&10',
      '转录导体·序三*5&5',
      '转录导体·序四*4&4',
      '转录导体·序五*3&3',
      '转录导体·序六*2&2',
      '坍塌晶条*66&66',
      '接入密匙*2&2',
      '专访许可*1&1',
      '基原信息核*1&1',
      '坍塌晶条x200&200',
      '坍塌晶条x648&648',
      '坍塌晶条x6480&6480',
      '少女前线2：追放 忤逆小队零钱包&1',
      '少女前线2：追放 夏日沁饮冰格套组 - 忤逆小队&1',
      '少女前线2：追放 黄区番茄-男/女指挥官（随机一款）&1',
      '少女前线2：追放 金属士气章 - 克莱妲&1',
      '番茄大王的袋子&1',
    ].map(itemName => {
      const [nameAndNum, numStr] = itemName.split('&');
      const name = nameAndNum.split('*')[0];
      return {
        name,
        num: Number(numStr),
        count: 0,
      };
    });

    const { list } = await request('lottery/history_list', { page_num: 1, page_size: 200 });
    list.forEach(({ reward_id }) => {
      const item = items[reward_id - 1];
      if (!item) return;
      item.count++;
    });

    const resultMap = {};

    items.forEach(({ name, num, count }) => {
      if (count > 0) {
        resultMap[name] = (resultMap[name] || 0) + num * count;
      }
    });

    console.table(resultMap);

    const result = Object.entries(resultMap)
      .map(([name, count]) => `${name} * ${count}`)
      .join('\n');

    alert(result);
  }

  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.inset = 'auto auto 8px 8px';
  div.style.display = 'flex';
  div.style.flexDirection = 'column';
  div.style.gap = '8px';
  div.style.zIndex = '100';

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
    button.style.borderRadius = '4px';
    button.addEventListener('click', async () => {
      try {
        button.disabled = true;
        button.textContent = '请求中...';
        await onClick();
      } catch (e) {
        console.error(e);
        alert(e.message);
      } finally {
        button.disabled = false;
        button.textContent = text;
      }
    });
    div.appendChild(button);
  };

  createBtn('一键完成', async () => {
    const MAX_PLAY = 3;
    const { play, share } = await getTaskStatus();

    for (let i = play; i < MAX_PLAY; i++) {
      await doGame();
    }

    if (share < 1) {
      await doShare();
    }

    const { needFillAddr, count: lottery } = await doLottery();

    let msg = `已完成游戏 ${MAX_PLAY - play} 次，分享 ${share < 1 ? '1' : '0'} 次，抽奖 ${lottery} 次`;
    if (needFillAddr) {
      msg += '\n中大奖了！请查看抽奖记录并填写收货地址！';
    }

    alert(msg);
  });

  createBtn('统计奖品', async () => {
    await showLotteryHistory();
  });

  document.body.appendChild(div);
})();
