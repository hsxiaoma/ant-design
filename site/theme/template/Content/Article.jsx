import React, { PropTypes, Children, cloneElement } from 'react';
// 多语言的实现
// 参考: https://segmentfault.com/a/1190000005824920
import { FormattedMessage } from 'react-intl';
// 根据不同的路由改变文档的title
// 参考: https://segmentfault.com/a/1190000010705479
import DocumentTitle from 'react-document-title';

import { getChildren } from 'jsonml.js/lib/utils';

// 时间轴 组件
// 参考: https://ant.design/components/timeline-cn/
import { Timeline } from 'antd';

import EditButton from './EditButton';
import * as utils from '../utils';

/**
 * 文章组件
 */
export default class Article extends React.Component {
  /**
   * 定义类的静态变量
   * @type {{intl: React.Validator<any>}}
   * 参考: https://segmentfault.com/a/1190000002878442
   * 任何想访问context里面的属性的组件都必须显式的指定一个contextTypes 的属性。
   * 如果没有指定改属性，那么组件通过 this.context 访问属性将会出错。
   * 如果你为一个组件指定了context，那么这个组件的子组件只要定义了contextTypes 属性，
   * 就可以访问到父组件指定的context了
   */
  static contextTypes = {
    intl: PropTypes.object.isRequired,
  }

  /**
   * 在初始化render之后只执行一次，在这个方法内，可以访问任何组件，
   * componentDidMount()方法中的子组件在父组件之前执行
   * 从这个函数开始，就可以和 JS 其他框架交互了，
   * 例如设置计时 setTimeout 或者 setInterval，或者发起网络请求
   * 参考: http://blog.csdn.net/ElinaVampire/article/details/51813677
   */
  componentDidMount() {
    this.componentDidUpdate();
  }

  /**
   * 组件更新结束之后执行，在初始化render时不执行
   * 参考: http://blog.csdn.net/ElinaVampire/article/details/51813677
   */
  componentDidUpdate() {
    // 扩展运算符（ spread ）是三个点（...）
    // 确保 links 返回真正的数组.
    const links = [...document.querySelectorAll('.outside-link.internal')];
    if (links.length === 0) {
      return;
    }
    // eslint-disable-next-line
    const checkImgUrl = 'https://g-assets.daily.taob' + 'ao.net/seajs/seajs/2.2.0/sea.js';
    this.pingTimer = utils.ping(checkImgUrl, (status) => {
      if (status !== 'timeout') {
        links.forEach(link => (link.style.display = 'block'));
      } else {
        links.forEach(link => link.parentNode.removeChild(link));
      }
    });
  }

  /**
   * 当组件要被从界面上移除的时候，就会调用componentWillUnmount(),
   * 在这个函数中，可以做一些组件相关的清理工作，例如取消计时器、网络请求等
   * 参考: http://blog.csdn.net/ElinaVampire/article/details/51813677
   */
  componentWillUnmount() {
    // 清除定时器
    clearTimeout(this.pingTimer);
  }

  /**
   * 获取文章
   * @param article 文章对象
   * @returns {*}
   */
  getArticle(article) {
    const { content } = this.props;
    const { meta } = content;
    if (!meta.timeline) {
      return article;
    }
    const timelineItems = [];
    let temp = [];
    let i = 1;
    // 迭代子组件
    // 参考: https://www.jianshu.com/p/d1975493b5ea
    Children.forEach(article.props.children, (child) => {
      if (child.type === 'h2' && temp.length > 0) {
        timelineItems.push(<Timeline.Item key={i}>{temp}</Timeline.Item>);
        temp = [];
        i += 1;
      }
      temp.push(child);
    });
    if (temp.length > 0) {
      timelineItems.push(<Timeline.Item key={i}>{temp}</Timeline.Item>);
    }
    // React 克隆组件
    // 通过 React.cloneElement 向子组件传递 state 及 function
    // 参考: https://segmentfault.com/a/1190000010062928
    return cloneElement(article, {
      children: <Timeline>{timelineItems}</Timeline>,
    });
  }
  render() {
    const props = this.props;
    const content = props.content;

    const { meta, description } = content;
    const { title, subtitle, filename } = meta;
    // 必须在 contextTypes 中定义 intl 对象
    // 参考: https://segmentfault.com/a/1190000002878442
    // https://segmentfault.com/a/1190000004636213
    // context就像javascript中的全局变量，只有真正全局的东西才适合放在context中
    const locale = this.context.intl.locale;
    return (
      <DocumentTitle title={`${title[locale] || title} - Ant Design`}>
        <article className="markdown">
          <h1>
            {title[locale] || title}
            {
              !subtitle || locale === 'en-US' ? null :
                <span className="subtitle">{subtitle}</span>
            }
            <EditButton title={<FormattedMessage id="app.content.edit-page" />}
                        filename={filename} />
          </h1>
          {
            !description ? null :
              props.utils.toReactComponent(
                ['section', { className: 'markdown' }].concat(getChildren(description))
              )
          }
          {
            (!content.toc || content.toc.length <= 1 || meta.toc === false) ? null :
              <section className="toc">
                {props.utils.toReactComponent(content.toc)}
                </section>
          }
          {
            this.getArticle(props.utils.toReactComponent(
              ['section', { className: 'markdown' }].concat(getChildren(content.content))
            ))
          }
        </article>
      </DocumentTitle>
    );
  }
}
