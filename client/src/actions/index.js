import axios from 'axios';
import { FETCH_USER } from './types';
import setauthtoken from '../utilis/setauthtoken';

export const fetchUser = () => async dispatch => {
  if (localStorage.JWT) {
    setauthtoken(localStorage.JWT);
  }
  const res = await axios.get('/api/current_user');
  dispatch({ type: FETCH_USER, payload: res.data });
};

export const handleToken = props => async dispatch => {
  const res = await axios.post('/api/stripe', props);
  dispatch({ type: FETCH_USER, payload: res.data });
};

export const cancelSubscription = () => async dispatch => {
  const res = await axios.get('/api/stripe/cancel');
  console.log(res.data, 'action');
  dispatch({ type: FETCH_USER, payload: res.data });
};
