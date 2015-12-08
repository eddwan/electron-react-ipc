'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import Lightbox from './react-lightbox.js';

const App = React.createClass({
  // API template to get newest wallpaper from alphacoders.com
  source: "http://wall.alphacoders.com/api1.0/get.php?auth=9d1d1f1bb35191348e2c54556dd4bf62",
  getInitialState() {
    return {
      // Images info (including url, thumbnail and title).
      images: [],
      lightboxIsOpen: false,
    };
  },
  // Preload images in background to avoid delay when user click on thumbnail
  preloadImages: [],
  preloadImages: function() {
    $.each(this.state.images, function(i, image) { $.get(image.link); });
  },
  queryWallpapers: function(page) {
    // There are 30 wallpapers on each page
    var url = this.source + "&page=" + page;
    // AJAX request for wallpapers
    $.get(url, function(result) {
      var items = [];
      for (var i = 0; i < result.wallpapers.length; i++) {
        items.push({
          link: result.wallpapers[i].url,
          thumbnailLink: result.wallpapers[i].thumb.url,
          // The wallpaper info from this API does not have title. Use combination of
          // category and sub_category as title (for this demo).
          title: result.wallpapers[i].category + ' - ' + result.wallpapers[i].sub_category
        });
      }
      if (this.isMounted()) {
        this.setState({
          images: this.state.images.concat(items),
          lightboxIsOpen: true,
        });
      }
      // Continue query for more wallpapers until we have at least 100.
      if (this.state.images.length < 100) {
        this.queryWallpapers(page + 1);
      } else {
        // Wait for 1 sec (so that the thumbnail will be loaded before preloading the
        // real wallpaper).
        setTimeout(this.preloadImages, 1000);
      }
    }.bind(this));
  },
  componentDidMount: function () {
    this.queryWallpapers(1);
  },
  onWallpaperSelected: function(index) {
    if (index < 0 || index > this.state.images.length) {
      console.log("Index out of range: ", index);
      return;
    }
    // Communicate to the main process (via remote) to set desktop wallpaper to the
    // given url.
    var url = this.state.images[index].link;
    setWallpaper(url);
  },
  render: function() {
    return (
      <div>
        <Lightbox
          images={this.state.images}
          keyboard
          onWallpaperSelected={this.onWallpaperSelected}
        />
      </div>
    );
  }

});


(function() {
  ReactDOM.render(<App/>, document.getElementById('react-root'));
})();