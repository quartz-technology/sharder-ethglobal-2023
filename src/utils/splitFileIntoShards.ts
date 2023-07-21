import { Split } from "./crypto/shamir";
import { Buffer } from "buffer";

export async function splitFileIntoShards(file: File, numShards: number, threshold: number): Promise<File[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event: ProgressEvent<FileReader>) => {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const buffer = Buffer.from(arrayBuffer);
            const shards = Split(buffer, numShards, threshold);

            const shardFiles = shards.map((shard, index) => {
                const shardBuffer = Buffer.from(shard);
                const blob = new Blob([shardBuffer], { type: "application/octet-stream" });
                return new File([blob], `shard_${index + 1}`, { type: "application/octet-stream" });
            });

            resolve(shardFiles);
        };

        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

