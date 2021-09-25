'use strict';

const e = React.createElement;

class LikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {
    if (this.state.liked) {
      return 'You liked this.';
    }

    return e(
      'button',
      { onClick: () => this.setState({ liked: true }) },
      'Like'
    );
  }
}

const domContainer = document.querySelector('#like_button_container');
ReactDOM.render(e(LikeButton), domContainer);


const filter = function(geocoder, marker, map) {
  $("#filter-results").empty()
  let searchTerm = $("#search-filter").val();
  $.ajax({
    type: 'GET',
    url: '/electra/filter/',
    data: {
      'search_term': searchTerm
    },
    success: function(data) {
      data.forEach(([filter]) => {
        var filter = filter;
        var searchList = $(
          `<div>
                    <li class="search-list-item" data-idtext="${filter}" id="${filter}">${filter}</li>
                </div>`
        );
        searchList.appendTo('#filter-results');
      });

      let filterList = []
      $('#filter-results').click(function(event) {
        var filter = event.target.id;
        $('#filter-results').empty()
        filterList.push(filter)
        console.log(filterList)
        filterList.forEach((filter) => {
          var filterCol = $('<div id="filter-col"></div>');
          var filterPanel = $(
            `
            <div class="card filter-card m-3">
              <div class="card card-body" id="${filter}-cardbody" data-idtext="${filter}">
                ${filter}
              </div>
            </div>
          `
          );

          filterPanel.appendTo(filterCol);
          filterCol.appendTo('#filterCardList');
          // getVenueDetails(selectedVenue, geocoder, marker, map)
        });
      })
    }
  });
};