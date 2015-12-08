// Lightbox react module
// Code is originally adopted from https://github.com/LaustAxelsen/react-lightbox

import '../static/styles/lightbox.css';

var React = require('react');
var ReactDOM = require('react-dom');

var Carousel = React.createFactory(React.createClass({
  getInitialState: function () {
    return {
      current: this.props.current,
      // Only show onboarding instruction text when user hover the hot spot button.
      showOnboardingText: false,
      // This state (and the prop with the same name) keep track if we should show the
      // onboarding hot spot button to user. Onboarding hot spot button should only be shown
      // before user set wallpaper for the first time.
      shouldShowOnboarding: true,
    };
  },
  componentWillMount: function () {
    if (this.props.keyboard) {
      window.addEventListener('keydown', this.handleKeyboardInput);
    }
  },
  componentWillUnmount: function () {
    if (this.props.keyboard) {
      window.removeEventListener('keydown', this.handleKeyboardInput);
    }
  },
  handleKeyboardInput: function (event) {
    if (event.keyCode === 37) {
      this.backward();
    }
    if (event.keyCode === 39) {
      this.forward();
    }
    if (event.keyCode === 27) {
      this.props.close();
    }
  },
  getNextIndex: function () {
    return this.props.images.length === this.state.current + 1 ? 0 : this.state.current + 1;
  },
  getPreviousIndex: function () {
    return this.state.current === 0 ? this.props.images.length - 1 : this.state.current - 1;
  },
  forward: function (event) {
    if (event) {
      event.stopPropagation();
    }
    this.setState({
      current: this.getNextIndex()
    });
  },
  backward: function (event) {
    if (event) {
      event.stopPropagation();
    }
    this.setState({
      current: this.getPreviousIndex()
    });
  },
  onImageClick: function(event) {
    if (event) {
        event.stopPropagation();
    }
    this.props.onWallpaperSelected(this.state.current);
    this.setState({
      shouldShowOnboarding: false,
      showOnboardingText: false,
    });
  },
  renderImages: function () {
    return this.props.images.map(function (image, index) {
      var currentImage = this.state.current === index;
      var className = 'react-lightbox-carousel-image';
      if (currentImage) {
        if (this.state.showOnboardingText) {
          className += ' react-lightbox-carousel-image-darken';
        }
        return React.DOM.img({
          key: index,
          className: className,
          src: this.props.images[this.state.current].link,
          onClick: this.onImageClick,
        });
      } else {
        className = 'react-lightbox-carousel-image-hidden';
        return React.DOM.img({
          key: index,
          className: className,
          src: this.props.images[this.state.current].link,
        });
      }
    }, this);
  },
  onHotspotMouseOver: function(event) {
    console.log("Mouse over");
    this.setState({
      showOnboardingText: true,
    });
  },
  onHotspotMouseOut: function(event) {
    console.log("Mouse out");
    this.setState({
        showOnboardingText: false,
    });
  },
  renderOnboarding: function() {
    // Dont show hot spot and instruction if user already set wallpaper before.
    if (!this.props.shouldShowOnboarding || !this.state.shouldShowOnboarding) {
        return;
    }
    var onboardingTextClassName = 'react-lightbox-carousel-instruction';
    if (this.state.showOnboardingText) {
        onboardingTextClassName += ' react-lightbox-carousel-instruction-show';
    }
    return React.DOM.div({},
      React.DOM.img(
        {
          key: 'hotspot',
          className: "react-lightbox-carousel-hot-spot",
          src: './static/images/pulsing_hot_spot.gif',
          onClick: this.onImageClick,
          onMouseOver: this.onHotspotMouseOver,
          onMouseOut: this.onHotspotMouseOut,
        },
      ), React.DOM.div(
        {
          className: onboardingTextClassName,
          onClick: this.onImageClick,
        },
        "Click on the image to set it as wallpaper"
      )
    );
  },
  renderTitle: function() {
    return React.DOM.div(
      {
        className: "react-lightbox-carousel-title",
      },
      this.props.images[this.state.current].title
    );
  },
  renderControls: function () {
    return React.DOM.div({
        className: 'my-controls'
      },
      React.DOM.div({
        className: 'my-button my-button-left',
        onClick: this.backward
      }, '<'),
      React.DOM.div({
        className: 'my-button my-button-right',
        onClick: this.forward
      }, '>')
    );
  },
  render: function () {
    return React.DOM.div({
      className: 'react-lightbox-carousel'
    },
    this.renderImages(),
    this.renderOnboarding(),
    this.renderTitle(),
    this.renderControls());
  }
}));

// Lightbox module that show preview of the wallpaper thumbnail and open the Carousel when
// user click on a thumbnail.
var Lightbox = React.createClass({
  getInitialState: function () {
    return {
      // This state keep track if we should show the onboarding hot spot button to user when
      // carousel is open.
      // Onboarding hot spot button should only be shown before user set wallpaper for the
      // first time.
      shouldShowOnboarding: true,
    };
  },
  componentDidMount: function () {
    // Overlay element to dim the view when carousel is shown.
    this.overlay = document.createElement('div');
    this.overlay.className = 'react-lightbox-overlay';
    this.overlay.addEventListener('webkitTransitionEnd', this.handleOverlayMounting);
  },
  componentWillUnmount: function () {
    this.overlay.removeEventListener('webkitTransitionEnd', this.handleOverlayMounting);
  },
  handleOverlayMounting: function () {
    if (!this.overlay.classList.contains('react-lightbox-overlay-open')) {
      React.unmountComponentAtNode(this.overlay);
      document.body.removeChild(this.overlay);
      window.removeEventListener('click', this.closeCarousel);
    }
  },
  onWallpaperSelected: function(index) {
    this.props.onWallpaperSelected(index);
    this.setState({
      shouldShowOnboarding: false,
    });
  },
  openCarousel: function (index) {
    this.overlay.innerHMTL = '';
    this.overlay.className = 'react-lightbox-overlay';
    document.body.appendChild(this.overlay);

    ReactDOM.render(
      Carousel({
        images: this.props.images,
        current: index,
        keyboard: this.props.keyboard,
        close: this.closeCarousel,
        onWallpaperSelected: this.onWallpaperSelected,
        shouldShowOnboarding: this.state.shouldShowOnboarding,
      }),
      this.overlay
    );

    requestAnimationFrame(
      function () {
        this.overlay.classList.add('react-lightbox-overlay-open');
        window.addEventListener('click', this.closeCarousel);
      }.bind(this)
    );
  },
  closeCarousel: function () {
    this.overlay.classList.remove('react-lightbox-overlay-open');
  },
  renderImages: function (image, index) {
    // Rendering the thumbnails
    return React.DOM.div(
      {
        key: index,
        className: 'react-lightbox-image',
        onClick: this.openCarousel.bind(this, index),
        style: {
          backgroundImage: 'url(' + image.thumbnailLink + ')'
        }
      }
    );
  },
  render: function () {
    return React.DOM.div(
      {
        className: 'react-lightbox'
      },
      (this.props.previews || this.props.images || []).map(this.renderImages)
    );
  }
})

module.exports = Lightbox;