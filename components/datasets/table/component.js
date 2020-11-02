import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { toastr } from 'react-redux-toastr';

// services
import { fetchDatasets } from 'services/dataset';

// components
import Spinner from 'components/ui/spinner';
import CustomTable from 'components/ui/customtable/CustomTable';
import SearchInput from 'components/ui/search-input';
import TableFilters from 'components/admin/table-filters';
import NameTD from './td/name';
import CodeTD from './td/code';
import StatusTD from './td/status';
import PublishedTD from './td/published';
import OwnerTD from './td/owner';
import RoleTD from './td/role';
import ApplicationsTD from './td/applications';
import UpdatedAtTD from './td/updated-at';
import RelatedContentTD from './td/related-content';
import EditAction from './actions/edit';
import DeleteAction from './actions/delete';

// constants
import { INITIAL_PAGINATION } from './constants';

// styles
import styles from './dataset-table.module.scss';

class DatasetsTable extends PureComponent {
  static propTypes = {
    user: PropTypes.object.isRequired,
    application: PropTypes.string.isRequired,
    showActions: PropTypes.boolean,
    showNewDatasetButton: PropTypes.boolean,
    showRelatedContent: PropTypes.boolean,
    linkToNewWidgetFromName: PropTypes.boolean
  }

  static defaultProps = {
    showActions: true,
    showNewDatasetButton: true,
    showRelatedContent: true,
    linkToNewWidgetFromName: false
  }

  state = {
    pagination: INITIAL_PAGINATION,
    loading: true,
    datasets: [],
    filters: { name: null, 'user.role': 'ADMIN' }
  };

  componentDidMount() {
    this.loadDatasets();
  }

  onFiltersChange = (value) => {
    this.setState({
      filters: {
        ...this.state.filters,
        'user.role': value.value
      }
    },
    () => this.loadDatasets());
  }

  /**
   * Event handler executed when the user search for a dataset
   * @param {string} { value } Search keywords
   */
  onSearch = debounce((value) => {
    const { filters } = this.state;

    if (value.length > 0 && value.length < 3) return;

    this.setState({
      loading: true,
      filters: {
        ...filters,
        name: value
      },
      pagination: INITIAL_PAGINATION
    }, () => this.loadDatasets());
  }, 250)

  onChangePage = (nextPage) => {
    const { pagination } = this.state;

    this.setState({
      loading: true,
      pagination: {
        ...pagination,
        page: nextPage
      }
    }, () => this.loadDatasets());
  }

  onRemoveDataset = () => {
    this.setState({ loading: true });
    this.loadDatasets();
  }

  loadDatasets = () => {
    const { user: { token }, application } = this.props;
    const { pagination, filters } = this.state;

    this.setState({ loading: true });

    fetchDatasets({
      includes: 'widget,layer,metadata,user',
      'page[number]': pagination.page,
      'page[size]': pagination.limit,
      application,
      ...filters
    }, { Authorization: token }, true)
      .then(({ datasets, meta }) => {
        const {
          'total-pages': pages,
          'total-items': size
        } = meta;
        const nextPagination = {
          ...pagination,
          size,
          pages
        };

        this.setState({
          loading: false,
          pagination: nextPagination,
          datasets: datasets.map(_dataset => ({
            ..._dataset,
            owner: _dataset.user ? _dataset.user.name || (_dataset.user.email || '').split('@')[0] : '',
            role: _dataset.user ? _dataset.user.role : ''
          }))
        });
      })
      .catch(error => toastr.error('There was an error loading the datasets', error));
  }

  render() {
    const {
      loading,
      pagination,
      datasets
    } = this.state;

    const {
      showActions,
      application,
      showNewDatasetButton,
      showRelatedContent,
      linkToNewWidgetFromName
    } = this.props;

    return (
      <div className={styles['c-dataset-table']}>
        <Spinner
          className="-light"
          isLoading={loading}
        />

        <TableFilters
          filtersChange={this.onFiltersChange}
          application={application}
        />

        <SearchInput
          input={{ placeholder: 'Search dataset' }}
          {...(showNewDatasetButton && {
            link: {
              label: 'New dataset',
              route: '/admin/data/datasets/new'
            }
          })}
          onSearch={this.onSearch}
        />
        <CustomTable
          columns={[
            { label: 'Name', value: 'name', td: NameTD, 
              tdProps: {
                route: '/admin/data',
                linkToNewWidget: linkToNewWidgetFromName
              }
            },
            { label: 'Code', value: 'code', td: CodeTD },
            { label: 'Status', value: 'status', td: StatusTD },
            { label: 'Published', value: 'published', td: PublishedTD },
            { label: 'Provider', value: 'provider' },
            { label: 'Owner', value: 'owner', td: OwnerTD },
            { label: 'Role', value: 'role', td: RoleTD },
            { label: 'Updated at', value: 'updatedAt', td: UpdatedAtTD },
            { label: 'Applications', value: 'application', td: ApplicationsTD },
            ...(showRelatedContent ? [{ label: 'Related content', value: 'status', td: RelatedContentTD, tdProps: { route: '/admin/data' } }] : [])
          ]}
          actions={{
            show: showActions,
            list: [
              { name: 'Edit', route: '/admin/data/datasets/edit', show: true, component: EditAction, componentProps: { route: '/admin/data' } },
              { name: 'Remove', component: DeleteAction }
            ]
          }}
          sort={{
            field: 'updatedAt',
            value: -1
          }}
          filters={false}
          data={datasets}
          onRowDelete={this.onRemoveDataset}
          onChangePage={this.onChangePage}
          pagination={pagination}
        />
      </div>
    );
  }
}

export default DatasetsTable;