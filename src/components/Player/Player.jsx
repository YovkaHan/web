import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { withRouter } from 'react-router-dom';
import Long from 'long';
import {
  getPlayer,
  getPlayerWinLoss,
} from '../../actions';
import strings from '../../lang';
import TabBar from '../TabBar';
import Spinner from '../Spinner';
import TableFilterForm from './TableFilterForm';
import PlayerHeader from './Header/PlayerHeader';
// import Error from '../Error';
import playerPages from './playerPages';

class RequestLayer extends React.Component {
  componentDidMount() {
    const { props } = this;
    const { playerId } = props.match.params;
    props.getPlayer(playerId);
    props.getPlayerWinLoss(playerId, props.location.search);
  }

  UNSAFE_componentWillUpdate(nextProps) {
    const props = nextProps;
    const { playerId } = props.match.params;
    if (this.props.match.params.playerId !== playerId) {
      props.getPlayer(playerId);
    }
    if (this.props.location.key !== props.location.key) {
      props.getPlayerWinLoss(playerId, props.location.search);
    }
  }

  render() {
    const { location, match } = this.props;
    const { playerId } = this.props.match.params;
    if (Long.fromString(playerId).greaterThan('76561197960265728')) {
      this.props.history.push(`/players/${Long.fromString(playerId).subtract('76561197960265728')}`);
    }
    const info = match.params.info || 'overview';
    const page = playerPages(playerId).find(_page => _page.key === info);
    const playerName = this.props.officialPlayerName || this.props.playerName || strings.general_anonymous;
    const title = page ? `${playerName} - ${page.name}` : playerName;
    return (
      <div>
        <Helmet title={title} />
        <div>
          <PlayerHeader playerId={playerId} location={location} />
          <TabBar info={info} tabs={playerPages(playerId)} />
        </div>
        <div>
          <TableFilterForm playerId={playerId} />
          {page ? page.content(playerId, match.params, location) : <Spinner />}
        </div>
      </div>
    );
  }
}

RequestLayer.propTypes = {
  location: PropTypes.shape({
    key: PropTypes.string,
  }),
  match: PropTypes.shape({
    params: PropTypes.shape({
      playerId: PropTypes.string,
    }),
  }),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  officialPlayerName: PropTypes.string,
  playerName: PropTypes.string,
};

const mapStateToProps = state => ({
  playerName: (state.app.player.data.profile || {}).personaname,
  officialPlayerName: (state.app.player.data.profile || {}).name,
});

const mapDispatchToProps = dispatch => ({
  getPlayer: playerId => dispatch(getPlayer(playerId)),
  getPlayerWinLoss: (playerId, options) => dispatch(getPlayerWinLoss(playerId, options)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(RequestLayer));
