import React from 'react';
// 复制到剪贴板
// https://github.com/nkbt/react-copy-to-clipboard
import CopyToClipboard from 'react-copy-to-clipboard';
import { Icon } from 'antd';

/**
 * 复制图标组件
 */
export default class CopyableIcon extends React.Component {
  /**
   * 构造器
   * @param props
   */
  constructor(props) {
    super(props);
    this.state = {
      justCopied: false,
    };
  }

  /**
   * 复制事件
   */
  onCopied = () => {
    // 修改 state --> justCopied 的值
    this.setState({ justCopied: true }, () => {
      // 延时处理,恢复状态
      setTimeout(() => {
        this.setState({ justCopied: false });
      }, 1000);
    });
  };

  render() {
    const text = `<Icon type="${this.props.type}" />`;
    return (
      <CopyToClipboard text={text} onCopy={this.onCopied}>
        <li className={this.state.justCopied ? 'copied' : ''}>
          <Icon type={this.props.type} />
          <span className="anticon-class">{this.props.type}</span>
        </li>
      </CopyToClipboard>
    );
  }
}
