import React from 'react';
import { Route, IndexRedirect } from 'react-router';
import MainContent from '../component/MainContent';
import Article from '../component/Article';
import ComponentDoc from '../component/ComponentDoc';
import demosList from '../../_site/data/demos-list';

function fileNameToPath(fileName) {
  const snippets = fileName.replace(/(\/index)?\.md$/i, '').split('/');
  return snippets[snippets.length - 1];
}

function getMenuItems(data) {
  const menuMeta = Object.keys(data)
          .map((key) => data[key])
          .map((file) => file.meta);

  const menuItems = {};
  menuMeta.sort((a, b) => {
    return parseInt(a.order, 10) - parseInt(b.order, 10);
  }).forEach((meta) => {
    const category = meta.category || 'topLevel';
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

export function generateContainer(data) {
  const menuItems = getMenuItems(data);
  return (props) => {
    return (
      <MainContent {...props} menuItems={menuItems} />
    );
  };
}

function getPagesData(data) {
  return Object.keys(data)
    .map((key) => data[key]);
}

export function generateChildren(data) {
  const pagesData = getPagesData(data);
  const children = pagesData.map((pageData, index) => {
    const meta = pageData.meta;
    const hasDemos = demosList[meta.fileName];
    const Wrapper = !hasDemos ?
            (props) => <Article {...props} content={pageData} /> :
            (props) => <ComponentDoc {...props} doc={pageData} />;
    return (
      <Route key={index}
        path={fileNameToPath(meta.fileName)}
        component={Wrapper} />
    );
  });

  const menuItems = getMenuItems(data);
  const firstChild = menuItems.topLevel.topLevel.find((item) => {
    return item.disabled !== 'true';
  });
  children.unshift(
    <IndexRedirect key="index"
      to={fileNameToPath(firstChild.fileName)} />
  );
  return children;
}