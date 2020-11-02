import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Next components
import Link from 'next/link';

// Components
import Icon from 'components/ui/icon';

// styles
import styles from './aside.module.scss';

class Aside extends PureComponent {
  static propTypes = {
    items: PropTypes.array,
    style: PropTypes.object,
    selected: PropTypes.string
  };

  static defaultProps = {
    items: [],
    style: {},
    selected: null
  };

  render() {
    const { style, selected, items } = this.props;
    return (
      <aside className={styles['c-aside']} style={style}>
        <nav>
          <ul>
            {items.filter(i => i.params).map((s) => {
              const active = (s.params || {}).subtab === selected;
              const activeClass = classnames({ '-active': active });

              return (
                <li key={s.value}>
                  <Link href={
                    {
                      pathname: s.route,
                      query: s.params
                    }}
                  >
                    <a className={activeClass}>
                      {active && <Icon className="c-icon -tiny" name="icon-arrow-right-2" />}
                      {s.label}
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    );
  }
}

export default Aside;
