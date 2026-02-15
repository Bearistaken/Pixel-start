
import { performance } from 'perf_hooks';
import { createColumn, updateColumn } from '../utils/matrixUtils.ts';
import type { MatrixColumn } from '../utils/matrixUtils.ts';

// --- Mocks and Types ---
type Cell = {
    val: string;
    isHead: boolean;
};

// --- Configuration ---
const ROWS = 50;
const COLS = 100;
const ITERATIONS = 1000;
const FADE = 0.05;

// --- Helper Functions ---
const trailMultiplier = Math.max(0.3, (1 - FADE * 3));

const getChar = () => {
    // Simplified getChar for benchmark
    return String.fromCharCode(0x30 + Math.floor(Math.random() * 10));
};

// --- Baseline Implementation (Old Code) ---
class BaselineMatrix {
    matrix: Cell[][]; // [row][col]
    length: number[];
    spaces: number[];
    updates: number[];
    count: number = 0;
    rows: number;
    cols: number;

    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.matrix = [];
        this.length = [];
        this.spaces = [];
        this.updates = [];

        // Init
        for (let r = 0; r < rows; r++) {
            const rowCells: Cell[] = [];
            for (let c = 0; c < cols; c++) {
                rowCells.push({ val: ' ', isHead: false });
            }
            this.matrix.push(rowCells);
        }

        for (let j = 0; j < cols; j++) {
            this.spaces[j] = Math.floor(Math.random() * rows) + 1;
            this.length[j] = Math.floor((Math.random() * (rows - 3) + 3) * trailMultiplier);
            this.updates[j] = Math.floor(Math.random() * 3) + 1;
        }
    }

    update() {
        this.count++;
        if (this.count > 4) this.count = 1;

        const { matrix, length, spaces, updates, rows, cols } = this;

        for (let j = 0; j < cols; j++) {
            if (this.count > updates[j]) {
                // Shift column down - THE BOTTLENECK
                for (let r = rows - 1; r > 0; r--) {
                    matrix[r][j] = { ...matrix[r - 1][j] };
                }

                // New content at row 0
                if (spaces[j] > 0) {
                    matrix[0][j] = { val: ' ', isHead: false };
                    spaces[j]--;
                } else {
                    if (length[j] > 0) {
                        matrix[0][j] = { val: getChar(), isHead: false };
                        length[j]--;
                    } else {
                        matrix[0][j] = { val: ' ', isHead: false };
                        spaces[j] = Math.floor(Math.random() * rows) + 1;
                        length[j] = Math.floor((Math.random() * (rows - 3) + 3) * trailMultiplier);
                    }
                }

                // Mark heads
                for (let r = rows - 1; r >= 0; r--) {
                    const cell = matrix[r][j];
                    if (cell.val !== ' ') {
                        const below = (r + 1 < rows) ? matrix[r + 1][j] : { val: ' ' };
                        cell.isHead = (below.val === ' ');

                        if (!cell.isHead && Math.random() < 0.05) {
                            cell.val = getChar();
                        }
                    }
                }
            }
        }
    }
}

// --- Optimized Implementation (Using New Utils) ---
class OptimizedMatrix {
    columns: MatrixColumn[];
    count: number = 0;
    rows: number;
    cols: number;

    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.columns = [];

        // Init using createColumn
        for (let j = 0; j < cols; j++) {
            this.columns.push(createColumn(rows, trailMultiplier));
        }
    }

    update() {
        this.count++;
        if (this.count > 4) this.count = 1;

        const { columns, rows, cols } = this;

        for (let j = 0; j < cols; j++) {
            const column = columns[j];
            if (this.count > column.updateSpeed) {
                updateColumn(column, rows, trailMultiplier, getChar);
            }
        }
    }
}

// --- Benchmark Runner ---
function runBenchmark() {
    console.log(`Running Benchmark: ${ITERATIONS} iterations, ${ROWS}x${COLS} matrix`);

    // Baseline
    const baseline = new BaselineMatrix(ROWS, COLS);
    const startBaseline = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        baseline.update();
    }
    const endBaseline = performance.now();
    const timeBaseline = endBaseline - startBaseline;
    console.log(`Baseline Time: ${timeBaseline.toFixed(2)} ms`);

    // Optimized
    const optimized = new OptimizedMatrix(ROWS, COLS);
    const startOpt = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        optimized.update();
    }
    const endOpt = performance.now();
    const timeOpt = endOpt - startOpt;
    console.log(`Optimized Time: ${timeOpt.toFixed(2)} ms`);

    console.log(`Improvement: ${(timeBaseline / timeOpt).toFixed(2)}x speedup`);
}

runBenchmark();
