import React from 'react';
import axios from 'axios';
import Auth from '../../lib/Auth';
import { Link } from 'react-router-dom';

class RecipesFavourite extends React.Component {
  state = {}

  componentDidMount() {
    axios.get('/api/me', {
      headers: { Authorization: `Bearer ${Auth.getToken()}` }
    })
      .then(res => this.setState({ user: res.data }));
  }

  render() {
    if(!this.state.user) return null;
    return(
      <div id="recipes-favourite">
        <h1 className="title is-3">Favourites</h1>
        {this.state.user.favourites.map((favourite, i) =>
          // <Link key={i} to={`/recipes/${favourite.id}`}>
            <p key={i}>{favourite.title}</p>
          // </Link>
        )}
      </div>
    );
  }
}

export default RecipesFavourite;
