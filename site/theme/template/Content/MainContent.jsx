import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Row, Col, Menu } from 'antd';
import Article from './Article';
import ComponentDoc from './ComponentDoc';
import * as utils from '../utils';
import config from '../../';

const SubMenu = Menu.SubMenu;

/**
 * 获取激活的菜单
 * @param props
 * @returns {*}
 */
function getActiveMenuItem(props) {
  return props.params.children || props.location.pathname;
}

/**
 * 将文件名转换为路径
 * @param filename
 * @returns {*|string}
 */
function fileNameToPath(filename) {
  const snippets = filename.replace(/(\/index)?((\.zh-CN)|(\.en-US))?\.md$/i, '').split('/');
  return snippets[snippets.length - 1];
}

/**
 * 不是顶级菜单
 * @param level
 * @returns {boolean}
 */
function isNotTopLevel(level) {
  return level !== 'topLevel';
}

/**
 * 主内容组件
 */
export default class MainContent extends React.Component {
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
   * 构造器
   * @param props
   */
  constructor(props) {
    super(props);
    this.state = { openKeys: [] };
  }

  /**
   * 在初始化render之后只执行一次，在这个方法内，可以访问任何组件，
   * componentDidMount()方法中的子组件在父组件之前执行
   * 从这个函数开始，就可以和 JS 其他框架交互了，
   * 例如设置计时 setTimeout 或者 setInterval，或者发起网络请求
   * 参考: http://blog.csdn.net/ElinaVampire/article/details/51813677
   */
  componentDidMount() {
    this.componentWillReceiveProps(this.props);
    this.componentDidUpdate();
  }

  /**
   * 当props发生变化时执行，初始化render时不执行，
   * 在这个回调函数里面，你可以根据属性的变化，
   * 通过调用this.setState()来更新你的组件状态，
   * 旧的属性还是可以通过this.props来获取,这里调用更新状态是安全的，
   * 并不会触发额外的render调用
   * 参考: http://blog.csdn.net/ElinaVampire/article/details/51813677
   * @param nextProps
   */
  componentWillReceiveProps(nextProps) {
    const prevModule = this.currentModule;
    this.currentModule = location.pathname.split('/')[2] || 'components';
    if (this.currentModule === 'react') {
      this.currentModule = 'components';
    }
    if (prevModule !== this.currentModule) {
      const moduleData = this.getModuleData(nextProps);
      const shouldOpenKeys = Object.keys(utils.getMenuItems(
        moduleData, this.context.intl.locale
      ));
      this.setState({ openKeys: shouldOpenKeys });
    }
  }

  /**
   * 组件更新结束之后执行，在初始化render时不执行
   * 参考: http://blog.csdn.net/ElinaVampire/article/details/51813677
   */
  componentDidUpdate() {
    if (!location.hash) {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    } else {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        document.getElementById(decodeURI(location.hash.replace('#', ''))).scrollIntoView();
      }, 10);
    }
  }

  /**
   * 当组件要被从界面上移除的时候，就会调用componentWillUnmount(),
   * 在这个函数中，可以做一些组件相关的清理工作，例如取消计时器、网络请求等
   * 参考: http://blog.csdn.net/ElinaVampire/article/details/51813677
   */
  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  /**
   * 菜碟打开时的事件
   * @param openKeys
   */
  handleMenuOpenChange = (openKeys) => {
    this.setState({ openKeys });
  }

  /**
   * 生成菜单项
   * @param isTop
   * @param item
   * @returns {*}
   */
  generateMenuItem(isTop, item) {
    const locale = this.context.intl.locale;
    const key = fileNameToPath(item.filename);
    const text = isTop ?
            item.title[locale] || item.title : [
              <span key="english">{item.title}</span>,
              <span className="chinese" key="chinese">{item.subtitle}</span>,
            ];
    const disabled = item.disabled;
    const url = item.filename.replace(/(\/index)?((\.zh-CN)|(\.en-US))?\.md$/i, '').toLowerCase();
    const child = !item.link ?
      <Link to={{ query: this.props.location.query, pathname: /^components/.test(url) ? `${url}/` : url }} disabled={disabled}>
        {text}
      </Link> :
      <a href={item.link} target="_blank" rel="noopener noreferrer" disabled={disabled}>
        {text}
      </a>;

    return (
      <Menu.Item key={key.toLowerCase()} disabled={disabled}>
        {child}
      </Menu.Item>
    );
  }

  /**
   * 生成子菜单
   * @param obj
   * @returns {*[]}
   */
  generateSubMenuItems(obj) {
    const topLevel = (obj.topLevel || []).map(this.generateMenuItem.bind(this, true));
    const itemGroups = Object.keys(obj).filter(isNotTopLevel)
      .sort((a, b) => config.typeOrder[a] - config.typeOrder[b])
      .map((type, index) => {
        const groupItems = obj[type].sort((a, b) => {
          return a.title.charCodeAt(0) -
          b.title.charCodeAt(0);
        }).map(this.generateMenuItem.bind(this, false));
        return (
          <Menu.ItemGroup title={type} key={index}>
            {groupItems}
          </Menu.ItemGroup>
        );
      });
    return [...topLevel, ...itemGroups];
  }

  /**
   * 获取模块数据
   * @param props
   * @returns {{meta: *}[] | *[]}
   */
  getModuleData(props) {
    const pathname = props.location.pathname;
    const moduleName = /^components/.test(pathname) ?
            'components' : pathname.split('/').slice(0, 2).join('/');
    const moduleData = moduleName === 'components' || moduleName === 'changelog' || moduleName === 'docs/react' ?
            [...props.picked.components, ...props.picked['docs/react'], ...props.picked.changelog] :
            props.picked[moduleName];
    const locale = this.context.intl.locale;
    const excludedSuffix = locale === 'zh-CN' ? 'en-US.md' : 'zh-CN.md';
    return moduleData.filter(({ meta }) => !meta.filename.endsWith(excludedSuffix));
  }

  /**
   * 获取所有菜单项
   * @returns {*[]}
   */
  getMenuItems() {
    const moduleData = this.getModuleData(this.props);
    const menuItems = utils.getMenuItems(
      moduleData, this.context.intl.locale
    );
    const topLevel = this.generateSubMenuItems(menuItems.topLevel);
    const subMenu = Object.keys(menuItems).filter(isNotTopLevel)
      .sort((a, b) => config.categoryOrder[a] - config.categoryOrder[b])
      .map((category) => {
        const subMenuItems = this.generateSubMenuItems(menuItems[category]);
        return (
          <SubMenu title={<h4>{category}</h4>} key={category}>
            {subMenuItems}
          </SubMenu>
        );
      });
    return [...topLevel, ...subMenu];
  }

  /**
   * 扁平化菜单
   * @param menu
   * @returns {*}
   */
  flattenMenu(menu) {
    if (menu.type === Menu.Item) {
      return menu;
    }

    if (Array.isArray(menu)) {
      return menu.reduce((acc, item) => acc.concat(this.flattenMenu(item)), []);
    }
    // 使用递归
    return this.flattenMenu(menu.props.children);
  }

  /**
   * 获取底部导航
   * @param menuItems
   * @param activeMenuItem
   * @returns {{prev: *, next: *}}
   */
  getFooterNav(menuItems, activeMenuItem) {
    const menuItemsList = this.flattenMenu(menuItems);
    let activeMenuItemIndex = -1;
    menuItemsList.forEach((menuItem, i) => {
      if (menuItem.key === activeMenuItem) {
        activeMenuItemIndex = i;
      }
    });
    const prev = menuItemsList[activeMenuItemIndex - 1];
    const next = menuItemsList[activeMenuItemIndex + 1];
    return { prev, next };
  }

  render() {
    const props = this.props;
    const activeMenuItem = getActiveMenuItem(props);
    const menuItems = this.getMenuItems();
    const { prev, next } = this.getFooterNav(menuItems, activeMenuItem);
    const localizedPageData = props.localizedPageData;
    return (
      <div className="main-wrapper">
        <Row>
          <Col lg={4} md={6} sm={24} xs={24}>
            <Menu className="aside-container" mode="inline"
              openKeys={this.state.openKeys}
              selectedKeys={[activeMenuItem]}
              onOpenChange={this.handleMenuOpenChange}
            >
              {menuItems}
            </Menu>
          </Col>
          <Col lg={20} md={18} sm={24} xs={24} className="main-container">
            {
              props.utils.get(props, 'pageData.demo') ?
                <ComponentDoc {...props} doc={localizedPageData} demos={props.demos} /> :
                <Article {...props} content={localizedPageData} />
            }
          </Col>
        </Row>

        <Row>
          <Col lg={{ span: 20, offset: 4 }}
            md={{ span: 18, offset: 6 }}
            sm={24} xs={24}
          >
            <section className="prev-next-nav">
              {
                prev ?
                  React.cloneElement(prev.props.children, { className: 'prev-page' }) :
                  null
              }
              {
                next ?
                  React.cloneElement(next.props.children, { className: 'next-page' }) :
                  null
              }
            </section>
          </Col>
        </Row>
      </div>
    );
  }
}
