import { NativeModules, requireNativeComponent } from "react-native";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

const { AppLovinMAX } = NativeModules;

const {
  TOP_CENTER_POSITION,
  TOP_LEFT_POSITION,
  TOP_RIGHT_POSITION,
  CENTERED_POSITION,
  CENTER_LEFT_POSITION,
  CENTER_RIGHT_POSITION,
  BOTTOM_LEFT_POSITION,
  BOTTOM_CENTER_POSITION,
  BOTTOM_RIGHT_POSITION,

  BANNER_AD_FORMAT_LABEL,
  MREC_AD_FORMAT_LABEL,      
} = AppLovinMAX.getConstants();

export const AdFormat = {
  BANNER: BANNER_AD_FORMAT_LABEL,
  MREC: MREC_AD_FORMAT_LABEL,
};

export const AdViewPosition = {
  TOP_CENTER : TOP_CENTER_POSITION,
  TOP_LEFT : TOP_LEFT_POSITION,
  TOP_RIGHT : TOP_RIGHT_POSITION,
  CENTERED : CENTERED_POSITION,
  CENTER_LEFT : CENTER_LEFT_POSITION,
  CENTER_RIGHT : CENTER_RIGHT_POSITION,
  BOTTOM_LEFT : BOTTOM_LEFT_POSITION,
  BOTTOM_CENTER : BOTTOM_CENTER_POSITION,
  BOTTOM_RIGHT : BOTTOM_RIGHT_POSITION,
};

const AdView = (props) => {
  const {style, ...otherProps} = props;
  const [isInitialized, setIsInitialized] = useState(false);
  const [dimensions, setDimensions] = useState({});

  useEffect(() => {
    // check that AppLovinMAX has been initialized
    AppLovinMAX.isInitialized().then(result => {
      setIsInitialized(result);
      if (!result) {
        console.warn("ERROR: AppLovinMAX.AdView is mounted before the initialization of the AppLovin MAX React Native module");
      }
    });
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const sizeForBannerFormat = async () => {
      const isTablet = await AppLovinMAX.isTablet();
      const width = isTablet ? 728 : 320;
      let height;
      if (props.adaptiveBannerEnabled) {
        height = await AppLovinMAX.getAdaptiveBannerHeightForWidth(-1);
      } else {
        height = isTablet ? 90 : 50;
      }
      setDimensions({width: (style.width && style.width !== 'auto') ? style.width : width,
                     height: (style.height && style.height !== 'auto') ? style.height : height});
    }

    // Check whether or not app specifies both width and height but not with 'auto'
    const isSizeSpecified = ((style.width && style.width !== 'auto') &&
                             (style.height && style.height !== 'auto'));

    if (!isSizeSpecified) {
      if (props.adFormat === AdFormat.BANNER) {
        sizeForBannerFormat();
      } else {
        setDimensions({width: (style.width && style.width !== 'auto') ? style.width : 300,
                       height: (style.height && style.height !== 'auto') ? style.height : 250});
      }
    }
  }, [isInitialized]);

  const onAdLoadedEvent = (event) => {
    if (props.onAdLoaded) props.onAdLoaded(event.nativeEvent);
  };

  const onAdLoadFailedEvent = (event) => {
    if (props.onAdLoadFailed) props.onAdLoadFailed(event.nativeEvent);
  };

  const onAdDisplayFailedEvent = (event) => {
    if (props.onAdDisplayFailed) props.onAdDisplayFailed(event.nativeEvent);
  };

  const onAdClickedEvent = (event) => {
    if (props.onAdClicked) props.onAdClicked(event.nativeEvent);
  };

  const onAdExpandedEvent = (event) => {
    if (props.onAdExpanded) props.onAdExpanded(event.nativeEvent);
  };

  const onAdCollapsedEvent = (event) => {
    if (props.onAdCollapsed) props.onAdCollapsed(event.nativeEvent);
  };

  const onAdRevenuePaidEvent = (event) => {
    if (props.onAdRevenuePaid) props.onAdRevenuePaid(event.nativeEvent);
  };

  // Not initialized
  if (!isInitialized) {
    return null;
  } else {
    const isSizeSpecified = ((style.width && style.width !== 'auto') &&
                             (style.height && style.height !== 'auto'));
    const isDimensionsSet = (Object.keys(dimensions).length > 0);

    // Not sized yet
    if (!(isSizeSpecified || isDimensionsSet)) {
      return null;
    }
  }

  return (
    <AppLovinMAXAdView
      style={{...style, ...dimensions}}
      onAdLoadedEvent={onAdLoadedEvent}
      onAdLoadFailedEvent={onAdLoadFailedEvent}
      onAdDisplayFailedEvent={onAdDisplayFailedEvent}
      onAdClickedEvent={onAdClickedEvent}
      onAdExpandedEvent={onAdExpandedEvent}
      onAdCollapsedEvent={onAdCollapsedEvent}
      onAdRevenuePaidEvent={onAdRevenuePaidEvent}
      {...otherProps}
    />
  );
};

AdView.propTypes = {
  /**
   * A string value representing the ad unit id to load ads for.
   */
  adUnitId: PropTypes.string.isRequired,

  /**
   * A string value representing the ad format to load ads for. Should be either `AppLovinMAX.AdFormat.BANNER` or `AppLovinMAX.AdFormat.MREC`.
   */
  adFormat: PropTypes.string.isRequired,

  /**
   * A string value representing the placement name that you assign when you integrate each ad format, for granular reporting in ad events.
   */
  placement: PropTypes.string,

  /**
   * A string value representing the customData name that you assign when you integrate each ad format, for granular reporting in ad events.
   */
  customData: PropTypes.string,

  /**
   * A boolean value representing whether or not to enable adaptive banners. Note that adaptive banners are enabled by default as of v2.3.0.
   */
  adaptiveBannerEnabled: PropTypes.bool,

  /**
   * A boolean value representing whether or not to enable auto-refresh. Note that auto-refresh is enabled by default.
   */
  autoRefresh: PropTypes.bool,

  /**
   * A callback fuction to be fired when a new ad has been loaded.
   */
  onAdLoaded: PropTypes.func,

  /**
   * A callback fuction to be fired when an ad could not be retrieved.
   */
  onAdLoadFailed: PropTypes.func,

  /**
   * A callback fuction to be fired when the ad failed to display.
   */
  onAdDisplayFailed: PropTypes.func,

  /**
   * A callback fuction to be fired when ad is clicked.
   */
  onAdClicked: PropTypes.func,

  /**
   * A callback fuction to be fired when the ad view is expanded.
   */
  onAdExpanded: PropTypes.func,

  /**
   * A callback fuction to be fired when the ad view is collapsed.
   */
  onAdCollapsed: PropTypes.func,

  /**
   * A callback fuction to be fired when the revenue event is detected.
   */
  onAdRevenuePaid: PropTypes.func,
};

// Defiens default values for the props.
AdView.defaultProps = {
  adaptiveBannerEnabled: true,
  autoRefresh: true,
};

// requireNativeComponent automatically resolves 'AppLovinMAXAdView' to 'AppLovinMAXAdViewManager'
const AppLovinMAXAdView = requireNativeComponent("AppLovinMAXAdView", AdView);

export default AdView;
