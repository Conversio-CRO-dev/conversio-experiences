function retryTest(fn, tries = 5, delay = 100) {
  return new Promise((resolve, reject) => {
    const attempt = (attemptsLeft) => {
      try {
        const result = fn();
        resolve(result);
      } catch (err) {
        if (attemptsLeft <= 0) {
          reject(err);
        } else {
          setTimeout(() => attempt(attemptsLeft - 1), delay);
        }
      }
    };
    attempt(tries);
  });
}

function handleLoadFailure(error, tries, retryFn) {
  console.error(`Load failed (attempt ${tries}):`, error);
  if (tries > 0) {
    console.log(`Retrying in 1s... (${tries} attempts left)`);
    setTimeout(retryFn, 1000);
  } else {
    console.error('Experience failed to load after all retries');
  }
}

module.exports = { retryTest, handleLoadFailure };
