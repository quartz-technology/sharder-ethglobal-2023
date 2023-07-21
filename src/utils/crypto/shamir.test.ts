import {Split, Combine, interpolatePolynomial, div, add, mult, Polynomial} from "./shamir";

test("TestSplit_invalid", () => {
    const secret = Buffer.from("test");

    expect(() => Split(secret, 0, 0)).toThrow();
    expect(() => Split(secret, 2, 3)).toThrow();
    expect(() => Split(secret, 1000, 3)).toThrow();
    expect(() => Split(secret, 10, 1)).toThrow();
    expect(() => Split(Buffer.from(""), 3, 2)).toThrow();
});

test("TestSplit", () => {
    const secret = Buffer.from("test");

    const out = Split(secret, 5, 3);

    expect(out.length).toEqual(5);

    out.forEach((share: Buffer) => {
        expect(share.length).toEqual(secret.length + 1);
    });
});

test("TestCombine_invalid", () => {
    expect(() => Combine([])).toThrow();

    const parts = [Buffer.from("foo"), Buffer.from("ba")];
    expect(() => Combine(parts)).toThrow();

    const shortParts = [Buffer.from("f"), Buffer.from("b")];
    expect(() => Combine(shortParts)).toThrow();

    const sameParts = [Buffer.from("foo"), Buffer.from("foo")];
    expect(() => Combine(sameParts)).toThrow();
});

test("TestCombine", () => {
    const secret = Buffer.from("test");
    const out = Split(secret, 5, 3);

    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if (j === i) {
                continue;
            }
            for (let k = 0; k < 5; k++) {
                if (k === i || k === j) {
                    continue;
                }
                const parts = [out[i], out[j], out[k]];
                const recomb = Combine(parts);
                expect(recomb.toString()).toBe(secret.toString());
            }
        }
    }
});

test("TestField_Add", () => {
    expect(add(16,16)).toEqual(0);
    expect(add(3,4)).toEqual(7);
});

test("TestField_Mult", () => {
    expect(mult(3,7)).toEqual(9);
    expect(mult(3,0)).toEqual(0);
    expect(mult(0,3)).toEqual(0);
});

test("TestField_Divide", () => {
    expect(div(0,7)).toEqual(0);
    expect(div(3,3)).toEqual(1);
    expect(div(6,3)).toEqual(2);
});

test("TestPolynomial_Random", () => {
    const p = new Polynomial(42, 2);
    expect(p.coefficients[0]).toEqual(42);
});

test("TestPolynomial_Eval", () => {
    const p = new Polynomial(42, 1);
    let out = p.evaluate(0);
    expect(out).toEqual(42);
    out = p.evaluate(1);
    const exp = add(42, mult(1, p.coefficients[1]));
    expect(out).toEqual(exp);
});

test("TestInterpolate_Rand", () => {
    for (let i = 0; i < 256 ; i++) {
        const p = new Polynomial(i, 2);
        const x_vals = [1, 2, 3];
        const y_vals = [p.evaluate(1), p.evaluate(2), p.evaluate(3)];
        const out = interpolatePolynomial(x_vals, y_vals, 0);
        expect(out).toEqual(i);
    }
});