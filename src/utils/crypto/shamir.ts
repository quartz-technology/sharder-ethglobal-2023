import { Buffer } from "buffer";

// ShareOverhead is the byte size overhead of each share
// when using Split on a secret. This is caused by appending
// a one byte tag to the share.
//const ShareOverhead = 1;

export class Polynomial {
    public coefficients: number[];

    constructor(intercept: number, degree: number) {
        this.coefficients = new Array(degree + 1).fill(0);
        this.coefficients[0] = intercept;
        for (let i = 1; i < degree + 1; i++) {
            this.coefficients[i] = Math.floor(Math.random() * 256);
        }
    }

    public evaluate(x: number): number {
        if (x === 0) {
            return this.coefficients[0];
        }

        const degree: number = this.coefficients.length - 1;
        let out: number = this.coefficients[degree];

        for (let i = degree - 1; i >= 0; i--) {
            const coeff = this.coefficients[i];
            out = add(mult(out, x), coeff);
        }
        return out;
    }
}

export function add(a: number, b: number): number {
    return a ^ b;
}

export function mult(a: number, b: number): number {
    let r = 0;
    let i = 8;

    while (i > 0) {
        i--;
        // r = (-(b >> i & 1) & a) ^ (-(r >> 7) & 0x1B) ^ (r + r);
        r = ((((-((((b >> i) % 256) & 1) % 256)) % 256) & a) % 256) ^ (((-((r >> 7) % 256) & 0x1B) % 256) % 256) ^ ((r + r) % 256);
        r = r % 256;
    }

    return r;
}

export function div(a: number, b: number): number {
    if (b === 0) {
        throw new Error("divide by zero");
    }
    let ret = mult(a, inverse(b));
    ret = (a === 0) ? 0 : ret;
    return ret;
}

function inverse(a: number): number {
    let b = mult(a, a);
    let c = mult(a, b);
    b = mult(c, c);
    b = mult(b, b);
    c = mult(b, c);
    b = mult(b, b);
    b = mult(b, b);
    b = mult(b, c);
    b = mult(b, b);
    b = mult(a, b);
    return mult(b, b);
}

export function interpolatePolynomial(x_samples: number[], y_samples: number[], x: number): number {
    const limit = x_samples.length;
    let result = 0;
    let basis = 0;

    for (let i = 0; i < limit; i++) {
        basis = 1;
        for (let j = 0; j < limit; j++) {
            if (i === j) {
                continue;
            }
            const num = add(x, x_samples[j]);
            const denom = add(x_samples[i], x_samples[j]);
            const term = div(num, denom);
            basis = mult(basis, term);
        }
        const group = mult(y_samples[i], basis);
        result = add(result, group);
    }
    return result;
}

export function Split(secret: Buffer, parts: number, threshold: number): Buffer[] {
    if (parts < threshold) {
        throw new Error("parts cannot be less than threshold");
    }
    if (parts > 255) {
        throw new Error("parts cannot exceed 255");
    }
    if (threshold < 2) {
        throw new Error("threshold must be at least 2");
    }
    if (threshold > 255) {
        throw new Error("threshold cannot exceed 255");
    }
    if (secret.length == 0) {
        throw new Error("cannot split an empty secret");
    }

    let xCoordinates = Array.from({length: 255}, (_, i) => i + 1);
    xCoordinates = xCoordinates.sort(() => Math.random() - 0.5);

    // const out: Buffer[] = new Array(parts).fill(Buffer.alloc(secret.length + 1));
    const out: Buffer[] = Array.from({length: parts});
    for (let idx = 0; idx < parts; idx++) {
        out[idx] = Buffer.alloc(secret.length + 1).fill(0);
        out[idx][secret.length] = (xCoordinates[idx] % 256) + 1;
    }

    for (let idx = 0; idx < secret.length; idx++) {
        const val = secret[idx];
        const p = new Polynomial(val, (threshold - 1) % 256);

        for (let i = 0; i < parts; i++) {
            const x = ((xCoordinates[i] % 256) + 1);
            out[i][idx] = p.evaluate(x);
        }
    }

    return out;
}

export function Combine(parts: Buffer[]): Buffer {
    if (parts.length < 2) {
        throw new Error("less than two parts cannot be used to reconstruct the secret");
    }

    const firstPartLen = parts[0].length;
    if (firstPartLen < 2) {
        throw new Error("parts must be at least two bytes");
    }
    for (let i = 1; i < parts.length; i++) {
        if (parts[i].length != firstPartLen) {
            throw new Error("all parts must be the same length");
        }
    }

    const secret = Buffer.alloc(firstPartLen - 1).fill(0);
    const x_samples = new Array(parts.length).fill(0);
    const y_samples = new Array(parts.length).fill(0);
    const checkMap: {[key: number]: boolean} = {};

    for (let i = 0; i < parts.length; i++) {
        const samp = parts[i][firstPartLen - 1];
        if (checkMap[samp]) {
            throw new Error("duplicate part detected");
        }
        checkMap[samp] = true;
        x_samples[i] = samp;
    }

    for (let idx = 0; idx < secret.length; idx++) {
        for (let i = 0; i < parts.length; i++) {
            y_samples[i] = parts[i][idx];
        }

        secret[idx] = interpolatePolynomial(x_samples, y_samples, 0);
    }

    return secret;
}
