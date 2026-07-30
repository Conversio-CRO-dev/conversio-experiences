export function init(tries, runExperience) {
  const maxTries = tries || 5;
  let attemptCount = 0;

  const attemptInit = () => {
    attemptCount += 1;

    if (!document.body) {
      if (attemptCount < maxTries) {
        setTimeout(attemptInit, 500);
      } else {
        console.error('document.body not found after max retries');
      }
      return;
    }

    try {
      runExperience();
    } catch (err) {
      console.error('Experience execution failed:', err);
      if (attemptCount < maxTries) {
        setTimeout(attemptInit, 500);
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attemptInit);
  } else {
    attemptInit();
  }
}
