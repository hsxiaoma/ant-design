import React from 'react';
// 根据不同的路由改变文档的title
// 参考: https://segmentfault.com/a/1190000010705479
import DocumentTitle from 'react-document-title';
// 多语言的实现
// 参考: https://segmentfault.com/a/1190000005824920
import { FormattedMessage } from 'react-intl';

import classNames from 'classnames';
import { Row, Col, Icon, Affix } from 'antd';
import { getChildren } from 'jsonml.js/lib/utils';
import Demo from './Demo';
import EditButton from './EditButton';

/**
 * Doc 组件
 */
export default class ComponentDoc extends React.Component {
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
      expandAll: false,
    };
  }

  /**
   * 展开收缩事件
   */
  handleExpandToggle = () => {
    this.setState({
      expandAll: !this.state.expandAll,
    });
  }

  render() {
    const props = this.props;
    const { doc, location } = props;
    const { content, meta } = doc;
    // 必须在 contextTypes 中定义 intl 对象
    // 参考: https://segmentfault.com/a/1190000002878442
    // https://segmentfault.com/a/1190000004636213
    // context就像javascript中的全局变量，只有真正全局的东西才适合放在context中
    const locale = this.context.intl.locale;
    const demos = Object.keys(props.demos).map(key => props.demos[key]);
    const expand = this.state.expandAll;

    const isSingleCol = meta.cols === 1;
    const leftChildren = [];
    const rightChildren = [];
    const showedDemo = demos.some(demo => demo.meta.only) ?
            demos.filter(demo => demo.meta.only) : demos.filter(demo => demo.preview);
    showedDemo.sort((a, b) => a.meta.order - b.meta.order)
      .forEach((demoData, index) => {
        if (index % 2 === 0 || isSingleCol) {
          leftChildren.push(
            <Demo {...demoData}
              key={meta.filename + index} utils={props.utils}
              expand={expand} pathname={location.pathname}
            />
          );
        } else {
          rightChildren.push(
            <Demo {...demoData}
              key={meta.filename + index} utils={props.utils}
              expand={expand} pathname={location.pathname}
            />
          );
        }
      });
    const expandTriggerClass = classNames({
      'code-box-expand-trigger': true,
      'code-box-expand-trigger-active': expand,
    });

    const jumper = showedDemo.map((demo) => {
      const title = demo.meta.title;
      const localizeTitle = title[locale] || title;
      return (
        <li key={demo.meta.id} title={localizeTitle}>
          <a href={`#${demo.meta.id}`}>
            {localizeTitle}
          </a>
        </li>
      );
    });

    const { title, subtitle, filename } = meta;
    return (
      <DocumentTitle title={`${subtitle || ''} ${title[locale] || title} - Ant Design`}>
        <article>
          <Affix className="toc-affix" offsetTop={16}>
            <ul className="toc demos-anchor">
              {jumper}
            </ul>
          </Affix>
          <section className="markdown">
            <h1>
              {title[locale] || title}
              {
                !subtitle ? null :
                  <span className="subtitle">{subtitle}</span>
              }
              <EditButton title={<FormattedMessage id="app.content.edit-page" />} filename={filename} />
            </h1>
            {
              props.utils.toReactComponent(
                ['section', { className: 'markdown' }]
                  .concat(getChildren(content))
              )
            }
            <h2>
              <FormattedMessage id="app.component.examples" />
              <Icon type="appstore" className={expandTriggerClass}
                title="展开全部代码" onClick={this.handleExpandToggle}
              />
            </h2>
          </section>
          <Row gutter={16}>
            <Col span={isSingleCol ? '24' : '12'}
              className={isSingleCol ?
                'code-boxes-col-1-1' :
                'code-boxes-col-2-1'
              }
            >
              {leftChildren}
            </Col>
            {
              isSingleCol ? null :
                <Col className="code-boxes-col-2-1" span="12">{rightChildren}</Col>
            }
          </Row>
          {
            props.utils.toReactComponent(
              ['section', {
                className: 'markdown api-container',
              }].concat(getChildren(doc.api || ['placeholder']))
            )
          }
        </article>
      </DocumentTitle>
    );
  }
}
