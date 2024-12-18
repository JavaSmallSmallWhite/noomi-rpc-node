import { AbstractLoadBalancer } from "../AbstractLoadBalancer";
import { Selector } from "../Selector";
import * as math from "mathjs";
import { Random } from "random-js";

/**
 * 基于NOA的负载均衡器
 */
export class NoaLoadBalancer extends AbstractLoadBalancer {
  /**
   * 获取权重负载均衡选择器
   * @param serviceNodes 服务节点列表
   * @protected
   */
  protected getSelector(serviceNodes: Array<string>): Selector {
    return new this.noaSelector(serviceNodes);
  }

  private noaSelector = class NoaSelector implements Selector {
    private random = new Random();
    private readonly serviceNodes: Array<string>;

    public constructor(serviceNodes: Array<string>) {
      this.serviceNodes = serviceNodes;
    }

    public getNext(): string {
      return this.serviceNodes[0];
    }

    private Noa(
      objective: (x: number[]) => number,
      lb: number[],
      ub: number[],
      D: number,
      N: number,
      T: number
    ) {
      // Initialize population
      const pop = Array(N)
        .fill(0)
        .map(() => ({
          position: Array.from({ length: D }, (_, i) => this.random.real(lb[i], ub[i], true)),
          cost: 0
        }));
      const PR1 = pop.map((individual) => [...individual.position]);
      const PR2 = pop.map((individual) => [...individual.position]);

      pop.forEach((individual) => {
        individual.cost = objective(individual.position);
      });

      // Sort population by cost
      pop.sort((a, b) => a.cost - b.cost);

      let X_best = pop[0];
      const BestCost: number[] = [];

      // Main loop
      for (let it = 0; it < T; it++) {
        const X_mean = math.mean(
          pop.map((p) => p.position),
          0
        ) as unknown as number[];
        const Pa1 = 1 - it / T;
        const alpha =
          Math.random() > Math.random()
            ? Math.pow(1 - it / T, (2 * it) / T)
            : Math.pow(it / T, 2 / it);

        const newpop = pop.map((p) => ({ ...p }));

        pop.forEach((individual, i) => {
          if (Math.random() <= Pa1) {
            // Exploration phase 1
            const r = Math.random();
            const r1 = Math.random();
            const r2 = Math.random();
            const tau3 = Math.random();
            const tau4 = math.random([1], 0, 1)[0];
            const tau5 = this.levyFlight(1)[0];

            const u = r1 < r2 ? tau3 : r2 < Math.random() ? tau4 : tau5;

            newpop[i].position = individual.position.map((xi, j) =>
              r < Pa1
                ? xi + this.levyFlight(1)[0] * (X_best.position[j] - xi) * u
                : X_mean[j] +
                  this.levyFlight(1)[0] * (PR1[i][j] - PR2[i][j]) * u +
                  Math.random() * (ub[j] - lb[j])
            );

            newpop[i].position = newpop[i].position.map((x, j) =>
              math.max(math.min(x, ub[j]), lb[j])
            );

            newpop[i].cost = objective(newpop[i].position);
          } else {
            // Exploitation phase 2
            const phi = Math.random();
            if (phi > 0.4) {
              newpop[i].position = individual.position.map(
                (xi, j) => PR1[i][j] + alpha * Math.cos(phi) * (ub[j] - lb[j])
              );
            } else {
              newpop[i].position = individual.position.map(
                (xi, j) => PR2[i][j] + alpha * Math.cos(phi) * Math.random()
              );
            }

            newpop[i].position = newpop[i].position.map((x, j) =>
              math.max(math.min(x, ub[j]), lb[j])
            );

            newpop[i].cost = objective(newpop[i].position);
          }
        });

        // Greedy selection
        newpop.forEach((individual, i) => {
          if (individual.cost < pop[i].cost) {
            pop[i] = { ...individual };
          }
        });

        // Update best solution
        pop.sort((a, b) => a.cost - b.cost);
        X_best = pop[0];
        BestCost.push(X_best.cost);
      }

      return {
        Best_pos: X_best.position,
        Best_score: X_best.cost,
        curve: BestCost
      };
    }

    private generateNormalRandom(mean: number = 0, stdDev: number = 1): number {
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return z * stdDev + mean;
    }

    // Levy Flight function
    private levyFlight(D: number): number[] {
      const beta = 1.5;
      const sigma = Math.pow(
        (math.gamma(1 + beta) * Math.sin((Math.PI * beta) / 2)) /
          (math.gamma((1 + beta) / 2) * beta * Math.pow(2, (beta - 1) / 2)),
        1 / beta
      );
      // 生成正态分布随机数数组
      const u = Array.from({ length: D }, () => this.generateNormalRandom(0, sigma)); // 数组 u
      const v = Array.from({ length: D }, () => this.generateNormalRandom(0, 1));
      return u.map((ui, i) => ui / Math.pow(Math.abs(v[i]), 1 / beta));
    }
  };
}
