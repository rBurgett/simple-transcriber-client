import { connect } from 'react-redux';
import Transcriptions from './transcriptions';
import * as appActions from '../../actions/app-actions';

export default connect(
  ({ appState }) => ({
    windowHeight: appState.windowHeight,
    transcriptions: appState.transcriptions,
    filter: appState.filter,
    filterType: appState.filterType,
    appliedFilter: appState.appliedFilter,
    appliedFilterType: appState.appliedFilterType
  }),
  dispatch => ({
    setFilter: filter => dispatch(appActions.setFilter(filter)),
    setFilterType: filterType => dispatch(appActions.setFilterType(filterType)),
    setAppliedFilter: () => dispatch(appActions.setAppliedFilter())
  })
)(Transcriptions);
