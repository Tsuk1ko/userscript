// ==UserScript==
// @name         少前2莱娅的热力运动一键脚本
// @namespace    https://github.com/Tsuk1ko
// @version      1.0.1
// @description  一键完成少前2莱娅的热力运动网页活动
// @author       神代綺凛
// @match        https://gf2.sunborngame.com/lydrlyd/*
// @icon         https://favicon.im/gf2.sunborngame.com
// @require      https://unpkg.com/js-md5@0.8.3/src/md5.js
// @license      MIT
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const API_BASE = 'https://gf2-h5levasitup-api.sunborngame.com/';

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
    return Math.floor(Math.random() * 30) + 150;
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
    const num = getRandomScore();
    await request('game/game_start', {});
    await request('game/game_settle', {
      session_id: 0,
      score: num,
    });
  }

  async function doShare() {
    const { nick_name } = await request('common/user_info', {});
    await request('task/share', { nick_name });
  }

  async function doLottery() {
    const { remain_cnt } = await request('lottery/remain_cnt', {});

    let needFillAddr = false;

    for (let i = 0; i < remain_cnt; i++) {
      const { need_fill_addr } = await request('lottery/do', {});
      if (need_fill_addr) needFillAddr = true;
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
    const status = await request('task/get_task_status', {});
    if (!status) throw new Error('获取任务状态失败');
    return {
      play: status.play_cnt,
      share: status.share_cnt,
    };
  }

  async function showLotteryHistory() {
    const items = [
      '萨狄斯金*2000',
      '战场报告*2000',
      '解析图纸*2000',
      '转录导体·序二*10',
      '转录导体·序三*5',
      '转录导体·序四*4',
      '转录导体·序五*3',
      '转录导体·序六*2',
      '塌缩晶条*66',
      '接入密匙*2',
      '专访许可*1',
      '基原信息核*1',
      '新装许可*1',
      '坍塌晶条*200',
      '坍塌晶条*648',
      '坍塌晶条*6480',
      '莱娅 热力运动系列斜跨邮差包*1',
      '莱娅 热力运动系列金属便携水壶*1',
    ].map(itemName => {
      const [name, numStr] = itemName.split('*');
      return {
        name,
        num: Number(numStr),
        count: 0,
      };
    });

    const { list } = await request('lottery/history_list', { page_num: 1, page_size: 200 });
    list.forEach(({ reward_id }) => {
      const item = items[reward_id];
      if (!item) return;
      item.count++;
    });

    const resultList = items
      .filter(item => item.count > 0)
      .map(({ name, num, count }) => [name, num * count]);

    console.table(Object.fromEntries(resultList));

    const result = resultList.map(([name, count]) => `${name} * ${count}`).join('\n');
    alert(result);
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
