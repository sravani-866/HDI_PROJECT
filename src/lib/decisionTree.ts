/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CountryData, HdiCategory, PredictionInput } from '../types.ts';

export interface DecisionNode {
  feature?: keyof PredictionInput;
  threshold?: number;
  left?: DecisionNode;
  right?: DecisionNode;
  category?: HdiCategory;
  samples: number;
  impurity: number;
  distribution: Record<HdiCategory, number>;
  gain?: number;
}

export class DecisionTree {
  root: DecisionNode | null = null;
  maxDepth: number;
  minSamplesSplit: number;
  featureImportances: Record<keyof PredictionInput, number> = {
    lifeExpectancy: 0,
    expectedSchooling: 0,
    meanSchooling: 0,
    gniPerCapita: 0,
  };

  constructor(maxDepth = 4, minSamplesSplit = 2) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  // Calculate Gini Impurity of a list of items
  private calculateGini(classes: HdiCategory[]): number {
    const total = classes.length;
    if (total === 0) return 0;

    const counts: Record<string, number> = {};
    for (const c of classes) {
      counts[c] = (counts[c] || 0) + 1;
    }

    let sumSquares = 0;
    for (const key in counts) {
      const p = counts[key] / total;
      sumSquares += p * p;
    }

    return 1 - sumSquares;
  }

  // Generate class distribution record
  private getDistribution(classes: HdiCategory[]): Record<HdiCategory, number> {
    const dist: Record<HdiCategory, number> = {
      'Very High': 0,
      'High': 0,
      'Medium': 0,
      'Low': 0,
    };
    for (const c of classes) {
      dist[c] = (dist[c] || 0) + 1;
    }
    return dist;
  }

  // Get majority class
  private getMajorityClass(classes: HdiCategory[]): HdiCategory {
    const counts = this.getDistribution(classes);
    let majority: HdiCategory = 'Low';
    let maxCount = -1;

    const categories: HdiCategory[] = ['Very High', 'High', 'Medium', 'Low'];
    for (const cat of categories) {
      if (counts[cat] > maxCount) {
        maxCount = counts[cat];
        majority = cat;
      }
    }
    return majority;
  }

  // Train the decision tree on a dataset
  fit(data: CountryData[]): void {
    // Reset feature importances
    this.featureImportances = {
      lifeExpectancy: 0,
      expectedSchooling: 0,
      meanSchooling: 0,
      gniPerCapita: 0,
    };

    this.root = this.buildTree(data, 0);

    // Normalize feature importances so they sum to 1.0 (or keep 0 if none)
    const sum = Object.values(this.featureImportances).reduce((a, b) => a + b, 0);
    if (sum > 0) {
      for (const key in this.featureImportances) {
        const k = key as keyof PredictionInput;
        this.featureImportances[k] = Number((this.featureImportances[k] / sum).toFixed(4));
      }
    }
  }

  private buildTree(data: CountryData[], depth: number): DecisionNode {
    const samples = data.length;
    const classes = data.map((d) => d.hdiCategory);
    const impurity = this.calculateGini(classes);
    const distribution = this.getDistribution(classes);
    const majorityCategory = this.getMajorityClass(classes);

    // Leaf node conditions
    if (
      depth >= this.maxDepth ||
      samples < this.minSamplesSplit ||
      impurity === 0
    ) {
      return {
        samples,
        impurity,
        distribution,
        category: majorityCategory,
      };
    }

    // Find the best split
    let bestGain = -1;
    let bestFeature: keyof PredictionInput | undefined;
    let bestThreshold = 0;
    let bestLeft: CountryData[] = [];
    let bestRight: CountryData[] = [];

    const features: (keyof PredictionInput)[] = [
      'lifeExpectancy',
      'expectedSchooling',
      'meanSchooling',
      'gniPerCapita',
    ];

    for (const feature of features) {
      // Get unique values and sort them to try thresholds halfway between adjacent values
      const values = Array.from(new Set(data.map((d) => d[feature] as number))).sort((a, b) => a - b);
      if (values.length < 2) continue;

      for (let i = 0; i < values.length - 1; i++) {
        const threshold = (values[i] + values[i + 1]) / 2;

        const left = data.filter((d) => (d[feature] as number) <= threshold);
        const right = data.filter((d) => (d[feature] as number) > threshold);

        if (left.length === 0 || right.length === 0) continue;

        const leftGini = this.calculateGini(left.map((d) => d.hdiCategory));
        const rightGini = this.calculateGini(right.map((d) => d.hdiCategory));

        // Info gain or Gini reduction
        const weightLeft = left.length / samples;
        const weightRight = right.length / samples;
        const gain = impurity - (weightLeft * leftGini + weightRight * rightGini);

        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = feature;
          bestThreshold = threshold;
          bestLeft = left;
          bestRight = right;
        }
      }
    }

    // If no gain was achieved, make a leaf node
    if (bestGain <= 0 || !bestFeature) {
      return {
        samples,
        impurity,
        distribution,
        category: majorityCategory,
      };
    }

    // Record feature importance (weighted by number of samples at node)
    this.featureImportances[bestFeature] += bestGain * samples;

    // Recursively build children
    const leftNode = this.buildTree(bestLeft, depth + 1);
    const rightNode = this.buildTree(bestRight, depth + 1);

    return {
      feature: bestFeature,
      threshold: Number(bestThreshold.toFixed(2)),
      left: leftNode,
      right: rightNode,
      category: majorityCategory,
      samples,
      impurity,
      distribution,
      gain: Number(bestGain.toFixed(4)),
    };
  }

  // Predict HDI category and traverse the decision path
  predict(input: PredictionInput): {
    predictedCategory: HdiCategory;
    confidence: number;
    decisionPath: string[];
  } {
    if (!this.root) {
      throw new Error('Model is not trained yet.');
    }

    const decisionPath: string[] = [];
    let currentNode = this.root;

    while (currentNode.feature !== undefined && currentNode.threshold !== undefined) {
      const feat = currentNode.feature;
      const thresh = currentNode.threshold;
      const val = input[feat];

      const featLabels: Record<keyof PredictionInput, string> = {
        lifeExpectancy: 'Life Expectancy',
        expectedSchooling: 'Expected Years of Schooling',
        meanSchooling: 'Mean Years of Schooling',
        gniPerCapita: 'GNI per Capita',
      };

      if (val <= thresh) {
        decisionPath.push(`${featLabels[feat]} is <= ${thresh} (Value: ${val})`);
        if (!currentNode.left) break;
        currentNode = currentNode.left;
      } else {
        decisionPath.push(`${featLabels[feat]} is > ${thresh} (Value: ${val})`);
        if (!currentNode.right) break;
        currentNode = currentNode.right;
      }
    }

    const pred = currentNode.category || 'Low';
    const classCount = currentNode.distribution[pred] || 0;
    const confidence = currentNode.samples > 0 ? Number((classCount / currentNode.samples).toFixed(3)) : 1.0;

    return {
      predictedCategory: pred,
      confidence,
      decisionPath,
    };
  }

  // Perform cross-validation evaluate (Train/Test split)
  static evaluate(
    data: CountryData[],
    trainRatio = 0.8,
    maxDepth = 4,
    minSamplesSplit = 2
  ): {
    trainAccuracy: number;
    testAccuracy: number;
    confusionMatrix: {
      labels: HdiCategory[];
      matrix: number[][];
    };
    featureImportances: { feature: keyof PredictionInput; label: string; importance: number }[];
    treeDepth: number;
    totalSamples: number;
  } {
    // Seeded shuffle to make evaluation stable
    const shuffled = [...data];
    let l = shuffled.length;
    while (l > 0) {
      const i = Math.floor((l * 424242) % l);
      l--;
      const temp = shuffled[l];
      shuffled[l] = shuffled[i];
      shuffled[i] = temp;
    }

    const splitIdx = Math.floor(shuffled.length * trainRatio);
    const trainData = shuffled.slice(0, splitIdx);
    const testData = shuffled.slice(splitIdx);

    const model = new DecisionTree(maxDepth, minSamplesSplit);
    model.fit(trainData);

    // Calculate accuracies
    let trainCorrect = 0;
    for (const d of trainData) {
      const res = model.predict({
        lifeExpectancy: d.lifeExpectancy,
        expectedSchooling: d.expectedSchooling,
        meanSchooling: d.meanSchooling,
        gniPerCapita: d.gniPerCapita,
      });
      if (res.predictedCategory === d.hdiCategory) trainCorrect++;
    }
    const trainAccuracy = trainCorrect / trainData.length;

    let testCorrect = 0;
    const labels: HdiCategory[] = ['Very High', 'High', 'Medium', 'Low'];
    const matrix: number[][] = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];

    for (const d of testData) {
      const res = model.predict({
        lifeExpectancy: d.lifeExpectancy,
        expectedSchooling: d.expectedSchooling,
        meanSchooling: d.meanSchooling,
        gniPerCapita: d.gniPerCapita,
      });

      if (res.predictedCategory === d.hdiCategory) testCorrect++;

      const actualIdx = labels.indexOf(d.hdiCategory);
      const predIdx = labels.indexOf(res.predictedCategory);
      if (actualIdx !== -1 && predIdx !== -1) {
        matrix[actualIdx][predIdx]++;
      }
    }
    const testAccuracy = testData.length > 0 ? testCorrect / testData.length : 1.0;

    const featLabels: Record<keyof PredictionInput, string> = {
      lifeExpectancy: 'Life Expectancy',
      expectedSchooling: 'Expected Years of Schooling',
      meanSchooling: 'Mean Years of Schooling',
      gniPerCapita: 'GNI per Capita',
    };

    const sortedImportances = (Object.keys(model.featureImportances) as (keyof PredictionInput)[])
      .map((k) => ({
        feature: k,
        label: featLabels[k],
        importance: model.featureImportances[k],
      }))
      .sort((a, b) => b.importance - a.importance);

    return {
      trainAccuracy: Number(trainAccuracy.toFixed(3)),
      testAccuracy: Number(testAccuracy.toFixed(3)),
      confusionMatrix: {
        labels,
        matrix,
      },
      featureImportances: sortedImportances,
      treeDepth: maxDepth,
      totalSamples: data.length,
    };
  }
}
