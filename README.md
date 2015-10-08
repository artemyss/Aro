# Aro


Getting started: 

  npm install -g cordova ionic

You will need an Ionic account to upload and view the app on your phone through ionic view
Follow this link: http://ionicframework.com/docs/cli/uploading_viewing.html

To run in a browser (compass won't work because desktops don't have a built in compass) 
  ionic serve 
  ionic serve --lab
  ionic emulate android or ios (for this you need xcode or android development tools installed)
  
You can use the SASS file which is a part of Ionic - Ionic has great documentation on all of the steps
you will need to customize your app

Pro Tip: Focus on one platform first (Android or iOS)
BUG: (only with iOS) On lines 168 & 169 in controllers.js, you need to set 'trueHeading' to 'magneticHeading' 
      for compass to work  
