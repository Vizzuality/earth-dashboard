import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

// utils
import { substitution } from 'utils/utils';

class EditAction extends PureComponent {
  static propTypes = {
    data: PropTypes.object,
    action: PropTypes.object.isRequired
  };

  static defaultProps = { data: {} }

  getParsedParams() {
    const {
      data: { id },
      action: { params }
    } = this.props;

    return JSON.parse(substitution(JSON.stringify(params), [{ key: 'id', value: id }]));
  }

  render() {
    const { action: { route } } = this.props;

    return (
      <Link href={{
          pathname: route ,
          query: this.getParsedParams()
        }}
      >
        <a className="c-btn">Edit</a>
      </Link>
    );
  }
}

export default EditAction;
