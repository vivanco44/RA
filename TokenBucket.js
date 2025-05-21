class TokenBucket {
  constructor(ratePerSecond, capacity) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.rate = ratePerSecond;
    this.lastRefill = Date.now();
  }

  refill() {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    const tokensToAdd = Math.floor(elapsedSeconds * this.rate);

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  tryConsume() {
    this.refill();

    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }

    return false;
  }
}

module.exports = TokenBucket;
