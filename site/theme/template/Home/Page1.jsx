import React from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
//
// https://motion.ant.design/components/tween-one#components-tween-one-demo-position
import TweenOne from 'rc-tween-one';
// 动效组件
// https://motion.ant.design/api/scroll-anim
import ScrollOverPack from 'rc-scroll-anim/lib/ScrollOverPack';
import { Icon, Button } from 'antd';
// QueueAnim进出场动画
// https://motion.ant.design/components/queue-anim#components-queue-anim-demo-simple
import QueueAnim from 'rc-queue-anim';

// 获取高度
// 元素客户区的大小，指的是元素内容及其边框所占据的空间大小（经过实践取出来的大多是视口大小）
const clientHeight = document.documentElement.clientHeight;

/**
 * 滚动事件
 * @param e
 */
function onScrollEvent(e) {
  const header = document.getElementById('header');
  const headerClassName = 'home-nav-bottom';
  if (e.pageY >= clientHeight) {
    if (header.className.indexOf(headerClassName) < 0) {
      header.className += ` ${headerClassName}`;
    }
  } else if (header.className.indexOf(headerClassName) >= 0) {
    header.className = header.className.replace(/home-nav-bottom/ig, '');
  }
}

export default function Page1({ location }) {
  return (
    <ScrollOverPack scrollName="page1"
                    className="content-wrapper page"
                    playScale={1} replay scrollEvent={onScrollEvent}
                    hideProps={{ image: { reverse: true } }}
    >
      <TweenOne key="image"
                className="image1 image-wrapper"
                animation={{ x: 0, opacity: 1, duration: 550 }}
                style={{ transform: 'translateX(-100px)', opacity: 0 }}
      />
      <QueueAnim className="text-wrapper"
                 delay={300}
                 key="text"
                 duration={550}
                 leaveReverse>
        <h2 key="h2">
          <FormattedMessage id="app.home.best-practice" />
        </h2>
        <p key="p"
           style={{ maxWidth: 310 }}>
          <FormattedMessage id="app.home.experience" />
        </p>
        <div key="button">
          <Link to={{ query: location.query, pathname: '/docs/practice/cases' }}>
            <Button type="primary" size="large">
              <FormattedMessage id="app.home.learn-more" />
              <Icon type="right" />
            </Button>
          </Link>
        </div>
      </QueueAnim>
    </ScrollOverPack>
  );
}
