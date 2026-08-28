const TAU = Math.PI * 2;

function hash(value) {
  const noise = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  return noise - Math.floor(noise);
}

function setPosition(target, index, x, y, z) {
  const offset = index * 3;
  target[offset] = x;
  target[offset + 1] = y;
  target[offset + 2] = z;
}

function createStrandIndices(strands, samples, crossLinkStep = 0) {
  const indices = [];

  for (let strand = 0; strand < strands; strand += 1) {
    const base = strand * samples;
    for (let sample = 0; sample < samples - 1; sample += 1) {
      indices.push(base + sample, base + sample + 1);
    }
  }

  if (crossLinkStep > 0) {
    for (let sample = crossLinkStep; sample < samples; sample += crossLinkStep) {
      for (let strand = 0; strand < strands; strand += 2) {
        indices.push(
          strand * samples + sample,
          ((strand + 1) % strands) * samples + sample
        );
      }
    }
  }

  return indices;
}

function createCloudIndices(dimensions) {
  const [width, height, depth] = dimensions;
  const indices = [];
  const id = (x, y, z) => z * width * height + y * width + x;

  for (let z = 0; z < depth; z += 1) {
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (x + 1 < width) indices.push(id(x, y, z), id(x + 1, y, z));
        if (y + 1 < height) indices.push(id(x, y, z), id(x, y + 1, z));
        if (z + 1 < depth) indices.push(id(x, y, z), id(x, y, z + 1));
      }
    }
  }

  return indices;
}

export const LOOM_PALETTES = [
  { primary: 0xc4b5fd, secondary: 0x67e8f9 },
  { primary: 0x5eead4, secondary: 0x67e8f9 },
  { primary: 0x91a7ff, secondary: 0xfb7185 }
];

export function createLoomShapes({ coarse = false } = {}) {
  const strands = coarse ? 8 : 12;
  const samples = coarse ? 30 : 40;
  const count = strands * samples;
  const cloudDimensions = coarse ? [10, 6, 4] : [10, 8, 6];
  const targets = [
    new Float32Array(count * 3),
    new Float32Array(count * 3),
    new Float32Array(count * 3)
  ];
  const seeds = new Float32Array(count);

  for (let strand = 0; strand < strands; strand += 1) {
    const phase = TAU * (strand + 0.5) / strands;
    const strandSeed = hash(strand + 1);

    for (let sample = 0; sample < samples; sample += 1) {
      const t = sample / (samples - 1);
      const angle = TAU * t;
      const index = strand * samples + sample;
      const knotRadius = 0.67 + 0.22 * Math.cos(3 * angle);
      const tube = 0.035 + strandSeed * 0.028;

      setPosition(
        targets[0],
        index,
        knotRadius * Math.cos(2 * angle) + Math.cos(phase + angle) * tube,
        0.53 * Math.sin(3 * angle) + Math.sin(phase) * tube,
        knotRadius * Math.sin(2 * angle) + Math.sin(phase + angle) * tube
      );

      const streamY = (t - 0.5) * 1.78;
      const streamRadius = 0.19 + 0.62 * Math.pow(Math.abs(streamY) / 0.89, 0.7);
      const streamAngle = angle * 2.9 + phase;

      setPosition(
        targets[1],
        index,
        streamRadius * Math.cos(streamAngle),
        streamY + 0.03 * Math.sin(phase + streamAngle * 2),
        streamRadius * Math.sin(streamAngle)
      );

      seeds[index] = hash(index + 19);
    }
  }

  const [cloudWidth, cloudHeight, cloudDepth] = cloudDimensions;
  let cloudIndex = 0;

  for (let z = 0; z < cloudDepth; z += 1) {
    for (let y = 0; y < cloudHeight; y += 1) {
      for (let x = 0; x < cloudWidth; x += 1) {
        const jitter = (hash(cloudIndex + 73) - 0.5) * 0.035;
        setPosition(
          targets[2],
          cloudIndex,
          (x / (cloudWidth - 1) - 0.5) * 1.75 + jitter,
          (y / (cloudHeight - 1) - 0.5) * 1.28 - jitter * 0.5,
          (z / (cloudDepth - 1) - 0.5) * 1.3 + jitter * 0.8
        );
        cloudIndex += 1;
      }
    }
  }

  const dataIndices = createStrandIndices(strands, samples);
  const ringSamples = [0.2, 0.5, 0.8].map((ratio) => Math.round((samples - 1) * ratio));
  ringSamples.forEach((sample) => {
    for (let strand = 0; strand < strands; strand += 1) {
      dataIndices.push(
        strand * samples + sample,
        ((strand + 1) % strands) * samples + sample
      );
    }
  });

  return {
    count,
    strands,
    samples,
    targets,
    seeds,
    lineIndices: [
      createStrandIndices(strands, samples, coarse ? 9 : 8),
      dataIndices,
      createCloudIndices(cloudDimensions)
    ]
  };
}
