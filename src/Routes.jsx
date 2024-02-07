import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import App from './App';
import Map from './component/Map'; 

function Routes() {
  return (
    <Router forceRefresh={true}>
      <Switch>
        <Route exact path="/" component={App} />
        <Route path="/map" component={Map} />
      </Switch>
    </Router>
  );
}

export default Routes;
