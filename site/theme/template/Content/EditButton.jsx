import React from 'react';
import { Tooltip, Icon } from 'antd';

const branchUrl = 'https://github.com/ant-design/ant-design/blob/master/';

/**
 * 修改按钮组件
 * @param title 提示标题
 * @param filename 文件名称
 * @returns {*}
 * @constructor
 */
export default function EditButton({ title, filename }) {
  return (
    <Tooltip title={title}>
      <a className="edit-button"
         href={`${branchUrl}${filename}`}>
        <Icon type="edit" />
      </a>
    </Tooltip>
  );
}
