// Shared utility functions for all visualizations

// Helper function to generate random normal
const randn = () => {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

// Generate clustered 10D data
const generateClusteredData = (nPoints = 100, nClusters = 3, dims = 10) => {
  const data = [];
  const labels = [];
  const clusterCenters = [];

  // Generate random cluster centers
  for (let i = 0; i < nClusters; i++) {
    const center = Array(dims).fill(0).map(() => randn() * 3);
    clusterCenters.push(center);
  }

  // Generate points around each cluster
  for (let c = 0; c < nClusters; c++) {
    for (let i = 0; i < nPoints; i++) {
      const point = clusterCenters[c].map(val => val + randn() * 0.5);
      data.push(point);
      labels.push(c);
    }
  }
  return {
    data,
    labels,
    nClusters
  };
};

// PCA Implementation
const pca = (data, nComponents = 3) => {
  const n = data.length;
  const d = data[0].length;

  // Center the data
  const mean = Array(d).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < d; j++) {
      mean[j] += data[i][j];
    }
  }
  mean.forEach((_, i) => mean[i] /= n);
  const centered = data.map(row => row.map((val, i) => val - mean[i]));

  // Compute covariance matrix
  const cov = Array(d).fill(0).map(() => Array(d).fill(0));
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += centered[k][i] * centered[k][j];
      }
      cov[i][j] = sum / (n - 1);
    }
  }

  // Power iteration for top eigenvectors
  const eigenvectors = [];
  for (let comp = 0; comp < nComponents; comp++) {
    let v = Array(d).fill(0).map(() => Math.random());
    let norm = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
    v = v.map(val => val / norm);
    for (let iter = 0; iter < 100; iter++) {
      const Av = Array(d).fill(0);
      for (let i = 0; i < d; i++) {
        for (let j = 0; j < d; j++) {
          Av[i] += cov[i][j] * v[j];
        }
      }
      norm = Math.sqrt(Av.reduce((sum, val) => sum + val * val, 0));
      v = Av.map(val => val / norm);
    }
    eigenvectors.push(v);

    // Deflate covariance matrix
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        cov[i][j] -= v[i] * v[j] * norm;
      }
    }
  }

  // Project data
  const projected = centered.map(row => {
    return eigenvectors.map(ev => row.reduce((sum, val, i) => sum + val * ev[i], 0));
  });
  return projected;
};

// LDA Implementation
const lda = (data, labels, nComponents = 3) => {
  const n = data.length;
  const d = data[0].length;
  const classes = [...new Set(labels)];
  const nClasses = classes.length;

  // Compute overall mean
  const overallMean = Array(d).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < d; j++) {
      overallMean[j] += data[i][j];
    }
  }
  overallMean.forEach((_, i) => overallMean[i] /= n);

  // Compute class means
  const classMeans = {};
  const classCounts = {};
  classes.forEach(c => {
    classMeans[c] = Array(d).fill(0);
    classCounts[c] = 0;
  });
  for (let i = 0; i < n; i++) {
    const c = labels[i];
    classCounts[c]++;
    for (let j = 0; j < d; j++) {
      classMeans[c][j] += data[i][j];
    }
  }
  classes.forEach(c => {
    classMeans[c] = classMeans[c].map(v => v / classCounts[c]);
  });

  // Compute within-class scatter matrix
  const Sw = Array(d).fill(0).map(() => Array(d).fill(0));
  for (let i = 0; i < n; i++) {
    const c = labels[i];
    const diff = data[i].map((val, j) => val - classMeans[c][j]);
    for (let j = 0; j < d; j++) {
      for (let k = 0; k < d; k++) {
        Sw[j][k] += diff[j] * diff[k];
      }
    }
  }

  // Compute between-class scatter matrix
  const Sb = Array(d).fill(0).map(() => Array(d).fill(0));
  classes.forEach(c => {
    const diff = classMeans[c].map((val, j) => val - overallMean[j]);
    const nc = classCounts[c];
    for (let j = 0; j < d; j++) {
      for (let k = 0; k < d; k++) {
        Sb[j][k] += nc * diff[j] * diff[k];
      }
    }
  });

  // Compute Sw^-1 * Sb (simplified - using regularization)
  const lambda = 0.1;
  for (let i = 0; i < d; i++) {
    Sw[i][i] += lambda;
  }

  // Power iteration on Sw^-1 * Sb with orthogonalization
  const eigenvectors = [];
  for (let comp = 0; comp < Math.min(nComponents, nClasses - 1); comp++) {
    let v = Array(d).fill(0).map(() => Math.random());

    // Orthogonalize against previous eigenvectors
    for (let prevComp = 0; prevComp < eigenvectors.length; prevComp++) {
      const prev = eigenvectors[prevComp];
      const dot = v.reduce((sum, val, i) => sum + val * prev[i], 0);
      for (let i = 0; i < d; i++) {
        v[i] -= dot * prev[i];
      }
    }
    let norm = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
    if (norm < 1e-10) {
      // Random restart if orthogonalization resulted in zero vector
      v = Array(d).fill(0).map(() => Math.random());
      norm = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
    }
    v = v.map(val => val / norm);
    for (let iter = 0; iter < 100; iter++) {
      // Multiply by Sb
      const Sbv = Array(d).fill(0);
      for (let i = 0; i < d; i++) {
        for (let j = 0; j < d; j++) {
          Sbv[i] += Sb[i][j] * v[j];
        }
      }

      // Solve Sw * x = Sbv (using Gauss-Seidel iteration)
      let x = [...Sbv];
      for (let it = 0; it < 20; it++) {
        const newX = Array(d).fill(0);
        for (let i = 0; i < d; i++) {
          newX[i] = Sbv[i];
          for (let j = 0; j < d; j++) {
            if (i !== j) newX[i] -= Sw[i][j] * x[j];
          }
          newX[i] /= Sw[i][i];
        }
        x = newX;
      }

      // Orthogonalize against previous eigenvectors
      for (let prevComp = 0; prevComp < eigenvectors.length; prevComp++) {
        const prev = eigenvectors[prevComp];
        const dot = x.reduce((sum, val, i) => sum + val * prev[i], 0);
        for (let i = 0; i < d; i++) {
          x[i] -= dot * prev[i];
        }
      }
      norm = Math.sqrt(x.reduce((sum, val) => sum + val * val, 0));
      if (norm < 1e-10) break;
      v = x.map(val => val / norm);
    }
    eigenvectors.push(v);
  }

  // Project data
  const projected = data.map(row => {
    return eigenvectors.map(ev => row.reduce((sum, val, i) => sum + val * ev[i], 0));
  });
  return projected;
};

// Isomap Implementation
const isomap = (data, nComponents = 3, nNeighbors = 10) => {
  const n = data.length;

  // Compute pairwise distances
  const distances = Array(n).fill(0).map(() => Array(n).fill(Infinity));
  for (let i = 0; i < n; i++) {
    distances[i][i] = 0;
    for (let j = i + 1; j < n; j++) {
      let dist = 0;
      for (let k = 0; k < data[i].length; k++) {
        dist += (data[i][k] - data[j][k]) ** 2;
      }
      dist = Math.sqrt(dist);
      distances[i][j] = dist;
      distances[j][i] = dist;
    }
  }

  // Build k-nearest neighbor graph
  const graph = Array(n).fill(0).map(() => Array(n).fill(Infinity));
  for (let i = 0; i < n; i++) {
    graph[i][i] = 0;
    const neighbors = distances[i].map((d, idx) => ({
      dist: d,
      idx
    })).sort((a, b) => a.dist - b.dist).slice(1, nNeighbors + 1);
    neighbors.forEach(({
      dist,
      idx
    }) => {
      graph[i][idx] = dist;
      graph[idx][i] = dist;
    });
  }

  // Floyd-Warshall for shortest paths
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (graph[i][k] + graph[k][j] < graph[i][j]) {
          graph[i][j] = graph[i][k] + graph[k][j];
        }
      }
    }
  }

  // Handle disconnected components by replacing Infinity with max finite distance
  let maxFiniteDist = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (isFinite(graph[i][j]) && graph[i][j] > maxFiniteDist) {
        maxFiniteDist = graph[i][j];
      }
    }
  }
  const disconnectedDist = maxFiniteDist * 2;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (!isFinite(graph[i][j])) {
        graph[i][j] = disconnectedDist;
      }
    }
  }

  // Classical MDS on geodesic distances
  const D2 = graph.map(row => row.map(d => d * d));
  const rowMeans = D2.map(row => row.reduce((a, b) => a + b, 0) / n);
  const grandMean = rowMeans.reduce((a, b) => a + b, 0) / n;
  const B = Array(n).fill(0).map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      B[i][j] = -0.5 * (D2[i][j] - rowMeans[i] - rowMeans[j] + grandMean);
    }
  }

  // Power iteration for top eigenvectors and eigenvalues
  const eigenvectors = [];
  const eigenvalues = [];
  for (let comp = 0; comp < nComponents; comp++) {
    let v = Array(n).fill(0).map(() => Math.random());
    let norm = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
    v = v.map(val => val / norm);
    let eigenvalue = 0;
    for (let iter = 0; iter < 100; iter++) {
      const Bv = Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          Bv[i] += B[i][j] * v[j];
        }
      }
      eigenvalue = Math.sqrt(Bv.reduce((sum, val) => sum + val * val, 0));
      v = Bv.map(val => val / eigenvalue);
    }
    eigenvectors.push(v);
    eigenvalues.push(eigenvalue);

    // Deflate B to find next eigenvector
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        B[i][j] -= v[i] * v[j] * eigenvalue;
      }
    }
  }

  // Coordinates are eigenvectors scaled by sqrt(eigenvalue)
  const projected = Array(n).fill(0).map(() => Array(nComponents).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < nComponents; j++) {
      projected[i][j] = eigenvectors[j][i] * Math.sqrt(Math.abs(eigenvalues[j]));
    }
  }
  return projected;
};