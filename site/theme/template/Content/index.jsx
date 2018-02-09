import React from 'react';

// 参考: http://bluebirdjs.com/docs/getting-started.html
// https://www.cnblogs.com/showtime813/p/nodejs.html
// https://www.ibm.com/developerworks/cn/web/wa-lo-use-bluebird-implements-power-promise/index.html
import Promise from 'bluebird';
import MainContent from './MainContent';
import * as utils from '../utils';

const locale = utils.isZhCN() ? 'zh-CN' : 'en-US';

/**
 *
 * @param nextProps
 * @param callback
 */
export function collect(nextProps, callback) {
  const pageData = nextProps.location.pathname === 'changelog' ?
          nextProps.data.CHANGELOG : nextProps.pageData;

  if (!pageData) {
    // 404 错误
    callback(404, nextProps);
    return;
  }

  const pageDataPromise = typeof pageData === 'function' ?
          pageData() : (pageData[locale] || pageData.index[locale] || pageData.index)();
  const promises = [pageDataPromise];

  const pathname = nextProps.location.pathname;
  const demos = nextProps.utils.get(
    nextProps.data, [...pathname.split('/'), 'demo']
  );
  if (demos) {
    promises.push(demos());
  }
  Promise.all(promises)
    .then(list => callback(null, {
      ...nextProps,
      localizedPageData: list[0],
      demos: list[1],
    }));
}

export default (props) => {
  return <MainContent {...props} />;
};
