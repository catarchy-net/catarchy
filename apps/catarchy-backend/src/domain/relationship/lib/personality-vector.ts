export class CatPersonalityVector {
  public catId: string;

  private o: number;
  private c: number;
  private e: number;
  private a: number;
  private n: number;

  constructor({
    catId,
    openness,
    conscientiousness,
    extraversion,
    agreeableness,
    neuroticism,
  }: {
    catId: string;
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  }) {
    this.catId = catId;
    this.o = openness;
    this.c = conscientiousness;
    this.e = extraversion;
    this.a = agreeableness;
    this.n = neuroticism;
  }

  private weightedDistance({
    target,
    weights,
  }: {
    target: CatPersonalityVector;
    weights: { o: number; c: number; e: number; a: number; n: number };
  }) {
    const sum =
      weights.o * Math.pow(this.o - target.o, 2) +
      weights.c * Math.pow(this.c - target.c, 2) +
      weights.e * Math.pow(this.e - target.e, 2) +
      weights.a * Math.pow(this.a - target.a, 2) +
      weights.n * Math.pow(this.n - target.n, 2);

    return Math.sqrt(sum);
  }

  public calculateFriendScore(target: CatPersonalityVector) {
    const penalty = this.weightedDistance({
      target,
      weights: { o: 0.4, c: 0.1, e: 0.3, a: 0, n: 0.2 },
    });

    const basicScore = 100 - penalty * 10;

    const correction = 0.5 + (this.a + target.a) / 20;

    return Math.max(0, Math.min(100, basicScore * correction));
  }

  public calculateLoveScore(target: CatPersonalityVector) {
    const penalty = this.weightedDistance({
      target,
      weights: { o: 0.2, c: 0.25, e: 0.1, a: 0, n: 0.45 },
    });

    const neuroticismPenalty = this.n > 7 && target.n > 7 ? 15 : 0;

    const basicScore = 100 - penalty * 10 - neuroticismPenalty;

    const correction = 0.4 + (this.a + target.a) / 16.6;

    const friendscore = this.calculateFriendScore(target);
    const friendCorrection =
      friendscore >= 60 ? Math.pow(friendscore - 60, 2) / 40 : 0;

    return Math.max(
      0,
      Math.min(100, basicScore * correction + friendCorrection),
    );
  }
}
