const { useState, useEffect } = React;

const Card = ({ children }) => <div className="card">{children}</div>;
const CardHeader = ({ children }) => <div className="card-header">{children}</div>;
const CardTitle = ({ children }) => <h2 className="card-title">{children}</h2>;
const CardContent = ({ children }) => <div className="card-content">{children}</div>;

// Helper function to generate random normal
const randn = () => {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
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

  return { data, labels, nClusters };
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

  // Power iteration for top eigenvectors (simplified)
  const eigenvectors = [];
  for (let comp = 0; comp < nComponents; comp++) {
    let v = Array(d).fill(0).map(() => Math.random());

    // Normalize
    let norm = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
    v = v.map(val => val / norm);

    // Power iteration
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
    return eigenvectors.map(ev =>
      row.reduce((sum, val, i) => sum + val * ev[i], 0)
    );
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

  // Power iteration on Sw^-1 * Sb
  const eigenvectors = [];
  for (let comp = 0; comp < Math.min(nComponents, nClasses - 1); comp++) {
    let v = Array(d).fill(0).map(() => Math.random());
    let norm = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
    v = v.map(val => val / norm);

    for (let iter = 0; iter < 50; iter++) {
      // Multiply by Sb
      const Sbv = Array(d).fill(0);
      for (let i = 0; i < d; i++) {
        for (let j = 0; j < d; j++) {
          Sbv[i] += Sb[i][j] * v[j];
        }
      }

      // Solve Sw * x = Sbv (using simple iteration)
      let x = [...Sbv];
      for (let it = 0; it < 10; it++) {
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

      norm = Math.sqrt(x.reduce((sum, val) => sum + val * val, 0));
      v = x.map(val => val / norm);
    }

    eigenvectors.push(v);
  }

  // Project data
  const projected = data.map(row => {
    return eigenvectors.map(ev =>
      row.reduce((sum, val, i) => sum + val * ev[i], 0)
    );
  });

  return projected;
};

// Isomap Implementation (simplified)
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
    // Find k nearest neighbors
    const neighbors = distances[i]
      .map((d, idx) => ({ dist: d, idx }))
      .sort((a, b) => a.dist - b.dist)
      .slice(1, nNeighbors + 1);

    neighbors.forEach(({ dist, idx }) => {
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

  // Classical MDS on geodesic distances
  const D2 = graph.map(row => row.map(d => d * d));

  // Center the matrix
  const rowMeans = D2.map(row => row.reduce((a, b) => a + b, 0) / n);
  const grandMean = rowMeans.reduce((a, b) => a + b, 0) / n;

  const B = Array(n).fill(0).map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      B[i][j] = -0.5 * (D2[i][j] - rowMeans[i] - rowMeans[j] + grandMean);
    }
  }

  // Power iteration for top eigenvectors
  const eigenvectors = [];
  for (let comp = 0; comp < nComponents; comp++) {
    let v = Array(n).fill(0).map(() => Math.random());
    let norm = Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
    v = v.map(val => val / norm);

    for (let iter = 0; iter < 100; iter++) {
      const Bv = Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          Bv[i] += B[i][j] * v[j];
        }
      }

      norm = Math.sqrt(Bv.reduce((sum, val) => sum + val * val, 0));
      v = Bv.map(val => val / norm);
    }

    eigenvectors.push(v);
  }

  // Coordinates are eigenvectors scaled by sqrt(eigenvalue)
  const projected = Array(n).fill(0).map(() => Array(nComponents).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < nComponents; j++) {
      projected[i][j] = eigenvectors[j][i];
    }
  }

  return projected;
};

const DimReductionViz = () => {
  const [plotsReady, setPlotsReady] = useState(false);

  useEffect(() => {
    // Wait for Plotly to be available
    if (typeof Plotly === 'undefined') {
      console.error('Plotly not loaded');
      return;
    }

    // Generate data
    const { data, labels, nClusters } = generateClusteredData(80, 3, 10);

    // Apply dimensionality reduction
    const pcaResult = pca(data, 3);
    const ldaResult = lda(data, labels, 3);
    const isomapResult = isomap(data, 3, 12);

    console.log('Data generated:', {
      pcaPoints: pcaResult.length,
      ldaPoints: ldaResult.length,
      isomapPoints: isomapResult.length
    });

    // Color palette
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1'];
    const colorMap = labels.map(l => colors[l]);

    // Create plots with error handling
    const createPlot = (result, title, divId) => {
      try {
        const trace = {
          x: result.map(p => p[0]),
          y: result.map(p => p[1]),
          z: result.map(p => p[2]),
          mode: 'markers',
          type: 'scatter3d',
          marker: {
            size: 5,
            color: colorMap,
            opacity: 0.8
          }
        };

        const layout = {
          title: title,
          scene: {
            xaxis: { title: 'Component 1' },
            yaxis: { title: 'Component 2' },
            zaxis: { title: 'Component 3' }
          },
          margin: { l: 0, r: 0, t: 40, b: 0 },
          height: 400
        };

        Plotly.newPlot(divId, [trace], layout);
        console.log(`${divId} plot created successfully`);
      } catch (error) {
        console.error(`Error creating ${divId}:`, error);
      }
    };

    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      createPlot(pcaResult, 'PCA (Maximum Variance)', 'pca-plot');
      createPlot(ldaResult, 'LDA (Class Separation)', 'lda-plot');
      createPlot(isomapResult, 'Isomap (Manifold Distance)', 'isomap-plot');
      setPlotsReady(true);
    }, 100);
  }, []);

  return (
    <div className="w-full h-full bg-gray-50 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dimensionality Reduction Comparison
          </h1>
          <p className="text-gray-600">
            10-dimensional clustered data reduced to 3D using three different techniques.
            Each colored group represents a cluster in the original high-dimensional space.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-blue-600">📊</span> PCA - Principal Component Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div id="pca-plot" />
              <p className="text-sm text-gray-600 mt-4">
                <strong>What it does:</strong> Finds directions of maximum variance. Like shining a light
                to cast shadows that show the most variation. Clusters remain spread out based on their
                overall differences, but may overlap if variance doesn't align with class boundaries.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-green-600">🎯</span> LDA - Linear Discriminant Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div id="lda-plot" />
              <p className="text-sm text-gray-600 mt-4">
                <strong>What it does:</strong> Maximizes separation between known classes while keeping
                each class tight. Notice how clusters are pushed further apart compared to PCA - it's
                specifically trying to make different colored groups distinguishable.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-purple-600">🗺️</span> Isomap - Isometric Mapping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div id="isomap-plot" />
              <p className="text-sm text-gray-600 mt-4">
                <strong>What it does:</strong> Preserves distances along the data manifold (walking distance).
                Points that are neighbors in high dimensions stay neighbors in 3D. Good for curved or
                non-linear structures. Notice how local neighborhood relationships are maintained.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Key Differences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <strong className="text-blue-600">PCA:</strong> Unsupervised, linear, maximizes variance.
                Best when you want to capture overall data structure without knowing about groups.
              </div>
              <div>
                <strong className="text-green-600">LDA:</strong> Supervised, linear, maximizes class separation.
                Best when you have labels and want to distinguish between groups.
              </div>
              <div>
                <strong className="text-purple-600">Isomap:</strong> Unsupervised, non-linear, preserves geodesic distances.
                Best for curved manifolds where straight-line distances are misleading.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

ReactDOM.render(<DimReductionViz />, document.getElementById('root'));
