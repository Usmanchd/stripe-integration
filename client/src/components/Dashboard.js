import './Dashboard.css';
import React, { useState } from 'react';
import Header from './Header';
import { connect } from 'react-redux';
import { Redirect, Link } from 'react-router-dom';
import { cancelSubscription } from '../actions/index';
export const Dashboard = ({ auth, cancelSubscription }) => {
  if (!auth) {
    return <Redirect to="/login" />;
  }
  return (
    <Header activeItem="dashboard">
      <h2 className="header">Dashboard page</h2>
      <h2>{auth.email}</h2>
      <h2>{auth.subscription && auth.subscription}</h2>
      <button onClick={cancelSubscription}>Cancel Subscription</button>
      <Link to="prices">
        <button>Update Subscription</button>
      </Link>
    </Header>
  );
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { cancelSubscription })(Dashboard);
