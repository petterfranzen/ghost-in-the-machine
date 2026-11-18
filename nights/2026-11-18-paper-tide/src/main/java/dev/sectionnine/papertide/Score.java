package dev.sectionnine.papertide;

/**
 * The evening's tally: how many lanterns this boat has gathered, and the best
 * any boat has managed. Numbers, and the handful of sentences that read them;
 * the host loads and stores the record, so this stays plain Java.
 */
public final class Score {
  public int run;
  public int last = -1;
  public int best;
  public boolean store;

  public void caught() {
    run++;
  }

  public void restart() {
    run = 0;
  }

  /** Banks the run, and marks a new record for the host to store. */
  public void finish() {
    last = run;
    if (run > best) {
      best = run;
      store = true;
    }
  }

  /** The best on show: this run counts from the moment it beats the record. */
  public int shown() {
    return Math.max(best, run);
  }

  public String tally() {
    String count = run + lanterns(run);
    return run > best ? count + " this boat, a new best." : count + " this boat, best " + best + ".";
  }

  public String slip() {
    if (last == 0) {
      return best == 0
          ? "The empty boat slips under the grate."
          : "The empty boat slips under. Best so far: " + best + lanterns(best) + ".";
    }
    return "That boat carried " + last + lanterns(last) + ". Best " + best + ".";
  }

  public String fold() {
    if (last < 0) {
      return "A fresh boat is folded at the top of the gutter.";
    }
    return "A fresh boat is folded. Last run " + last + lanterns(last) + ", best " + best + ".";
  }

  private static String lanterns(int n) {
    return n == 1 ? " lantern" : " lanterns";
  }
}
