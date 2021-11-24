import thunk from 'redux-thunk';
import {createStore, applyMiddleware} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';

import allReducers from './reducers';
import {NODE_ENV} from '../configuration';

const store = createStore(allReducers, NODE_ENV === 'development' ? composeWithDevTools(applyMiddleware(thunk)) : applyMiddleware(thunk));
export default store;
