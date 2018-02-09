/**
 *
 * @param moduleData
 * @param locale
 * @returns {{}}
 */
export function getMenuItems(moduleData, locale) {
  const menuMeta = moduleData.map(item => item.meta);
  const menuItems = {};
  menuMeta.sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  ).forEach((meta) => {
    const category = (meta.category && meta.category[locale]) || meta.category || 'topLevel';
    if (!menuItems[category]) {
      menuItems[category] = {};
    }

    const type = meta.type || 'topLevel';
    if (!menuItems[category][type]) {
      menuItems[category][type] = [];
    }

    menuItems[category][type].push(meta);
  });
  return menuItems;
}

/**
 * 判断语言
 * @returns {boolean}
 */
export function isZhCN() {
  if (location.search.indexOf('locale=zh-CN') > -1) {
    return true;
  }
  if (location.search.indexOf('locale=en-US') > -1) {
    return false;
  }

  // 从缓存或 navigator.language(浏览器的首选语言) 中读取
  // navigator 对象请参阅:
  // http://blog.csdn.net/zxcvbnm32123/article/details/53036932
  // https://www.cnblogs.com/kgdjgd/p/6524154.html
  // https://www.cnblogs.com/huyihao/p/6003110.html
  // http://www.w3school.com.cn/js/js_window_navigator.asp
  // http://www.w3school.com.cn/jsref/dom_obj_navigator.asp
  // TODO: 有点莫名奇妙的写法?
  const language = (
    typeof localStorage === 'undefined' ||
      !localStorage.getItem('locale')
  ) ? navigator.language : localStorage.getItem('locale');
  // 默认为中文简体
  return language === 'zh-CN';
}

/**
 *
 * @param url
 * @param callback
 * @returns {number}
 */
export function ping(url, callback) {
  // 创建一个 Image 对象
  const img = new Image();
  let done;
  const finish = (status) => {
    if (!done) {
      done = true;
      img.src = '';
      callback(status);
    }
  };
  img.onload = () => finish('responded');
  img.onerror = () => finish('error');
  img.src = url;
  return setTimeout(() => finish('timeout'), 1500);
}
