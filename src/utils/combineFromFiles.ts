import {Buffer} from "buffer";
import {Combine} from "./crypto/shamir";

export async function combineFromFiles(files: File[]): Promise<File> {
    // Convert Files to Buffers
    const parts = await Promise.all(files.map(file => file.arrayBuffer().then(buf => Buffer.from(buf))));

    // Use your existing Combine function
    const combinedBuffer = Combine(parts);

    return new File([combinedBuffer], "output");
}

