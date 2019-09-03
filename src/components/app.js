import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { activeTabs } from '../constants/';
import * as actions from '../actions/app-actions';
import New from './new';
import Transcriptions from './transcriptions';
import Vocabulary from './vocabulary';
import Settings from './settings';

const App = ({ activeTab, windowWidth, windowHeight, setActiveTab }) => {

  const styles = {
    container: {
      width: windowWidth,
      height: windowHeight,
      display: 'flex',
      flexDirection: 'column',
      flexWrap: 'nowrap',
      justifyContent: 'flex-start'
    },
    tabBarContainer: {
      paddingTop: 8
    },
    mainAreaContainer: {
      flexGrow: 1
    },
    firstTab: {
      marginLeft: 8
    },
    tab: {
      minWidth: 150
    }
  };

  const onTabClick = (e, tab) => {
    e.preventDefault();
    setActiveTab(tab);
  };

  return (
    <div style={styles.container}>
      <div style={styles.tabBarContainer}>
        <ul className="nav nav-tabs">
          <li style={styles.firstTab} className="nav-item">
            <a style={styles.tab} className={`nav-link ${activeTab === activeTabs.NEW ? 'active' : ''}`} href="#" onClick={e => onTabClick(e, activeTabs.NEW)}><i className="fas fa-plus" /> Upload New</a>
          </li>
          <li className="nav-item">
            <a style={styles.tab} className={`nav-link ${activeTab === activeTabs.TRANSCRIPTIONS ? 'active' : ''}`} href="#" onClick={e => onTabClick(e, activeTabs.TRANSCRIPTIONS)}><i className="fas fa-list" /> Transcriptions</a>
          </li>
          <li className="nav-item">
            <a style={styles.tab} className={`nav-link ${activeTab === activeTabs.VOCABULARY ? 'active' : ''}`} href="#" onClick={e => onTabClick(e, activeTabs.VOCABULARY)}><i className="fas fa-microphone" /> Vocabulary</a>
          </li>
          <li className="nav-item">
            <a style={styles.tab} className={`nav-link ${activeTab === activeTabs.SETTINGS ? 'active' : ''}`} href="#" onClick={e => onTabClick(e, activeTabs.SETTINGS)}><i className="fas fa-cog" /> Settings</a>
          </li>
        </ul>
      </div>
      <div style={styles.mainAreaContainer}>
        {activeTab === activeTabs.NEW ?
          <New />
          :
          activeTab === activeTabs.TRANSCRIPTIONS ?
            <Transcriptions />
            :
            activeTab === activeTabs.VOCABULARY ?
              <Vocabulary />
                :
                <Settings />
        }
      </div>
    </div>
  );
};
App.propTypes = {
  activeTab: PropTypes.string,
  windowWidth: PropTypes.number,
  windowHeight: PropTypes.number,
  setActiveTab: PropTypes.func
};
export default connect(
  ({ appState }) => ({
    activeTab: appState.activeTab,
    windowWidth: appState.windowWidth,
    windowHeight: appState.windowHeight
  }),
  dispatch => ({
    setActiveTab: activeTab => dispatch(actions.setActiveTab(activeTab))
  })
)(App);
