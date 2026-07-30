import { init, elementReady, fireDataLayerEvent } from '@conversio/helpers';

const runExperience = () => {
  console.log('CNV001 loaded');

  // Find key page elements
  elementReady('body')
    .then(() => {
      console.log('DOM ready');
      // Add your experience code here
    })
    .catch(err => console.error(err));
};

init(5, runExperience);
