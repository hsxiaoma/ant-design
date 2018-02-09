import React from 'react';
import ReactDOM from 'react-dom';
// 多语言的实现
// 参考: https://segmentfault.com/a/1190000005824920
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { Icon } from 'antd';
import EditButton from './EditButton';

/**
 * 演示组件
 */
export default class Demo extends React.Component {
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
    intl: React.PropTypes.object,
  }
  /**
   * 构造器
   * @param props
   */
  constructor(props) {
    super(props);

    this.state = {
      codeExpand: false,
    };
  }

  /**
   * 这个方法在初始化render时不会执行，当props或者state发生变化时执行，
   * 并且是在render之前，当新的props或者state不需要更新组件时，返回false
   * 参考: http://blog.csdn.net/ElinaVampire/article/details/51813677
   * @param nextProps
   * @param nextState
   * @returns {boolean}
   */
  shouldComponentUpdate(nextProps, nextState) {
    return (this.state.codeExpand || this.props.expand) !== (nextState.codeExpand || nextProps.expand);
  }

  handleCodeExapnd = () => {
    this.setState({ codeExpand: !this.state.codeExpand });
  }

  render() {
    const props = this.props;
    const {
      meta,
      src,
      content,
      preview,
      highlightedCode,
      style,
      highlightedStyle,
      expand,
    } = props;

    if (!this.liveDemo) {
      this.liveDemo = meta.iframe ? <iframe src={src} /> : preview(React, ReactDOM);
    }

    const codeExpand = this.state.codeExpand || expand;
    const codeBoxClass = classNames({
      'code-box': true,
      expand: codeExpand,
    });
    // 必须在 contextTypes 中定义 intl 对象
    // 参考: https://segmentfault.com/a/1190000002878442
    // https://segmentfault.com/a/1190000004636213
    // context就像javascript中的全局变量，只有真正全局的东西才适合放在context中
    const locale = this.context.intl.locale;
    const localizedTitle = meta.title[locale] || meta.title;
    const localizeIntro = content[locale] || content;
    const introChildren = props.utils
      .toReactComponent(['div'].concat(localizeIntro));

    const highlightClass = classNames({
      'highlight-wrapper': true,
      'highlight-wrapper-expand': codeExpand,
    });
    return (
      <section className={codeBoxClass} id={meta.id}>
        <section className="code-box-demo">
          {this.liveDemo}
          {
            style ?
              <style dangerouslySetInnerHTML={{ __html: style }} /> :
              null
          }
        </section>
        <section className="code-box-meta markdown">
          <div className="code-box-title">
            <a href={`#${meta.id}`}>
              {localizedTitle}
            </a>
            <EditButton title={<FormattedMessage id="app.content.edit-page" />}
                        filename={meta.filename} />
          </div>
          {introChildren}
          <Icon type="down-circle-o"
                title="Show Code"
                className="collapse"
                onClick={this.handleCodeExapnd}
          />
        </section>
        <section className={highlightClass}
          key="code"
        >
          <div className="highlight">
            {props.utils.toReactComponent(highlightedCode)}
          </div>
          {
            highlightedStyle ?
              <div key="style" className="highlight">
                <pre>
                  <code className="css"
                        dangerouslySetInnerHTML={{ __html: highlightedStyle }}
                  />
                </pre>
              </div> :
              null
          }
        </section>
      </section>
    );
  }
}
